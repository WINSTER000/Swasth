const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/queues/:facilityId
router.get('/:facilityId', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let queue = await Queue.findOne({ facility: req.params.facilityId, date: today })
      .populate('items.patient', 'name email phone')
      .populate('items.appointment')
      .populate('facility', 'name type address district');

    // Find all confirmed/active appointments for this facility
    const appointments = await Appointment.find({
      facility: req.params.facilityId,
      status: { $in: ['CONFIRMED', 'IN_QUEUE', 'IN_CONSULTATION'] },
    }).populate('patient', 'name email phone');

    if (!queue) {
      queue = await Queue.create({
        facility: req.params.facilityId,
        department: 'General Medicine',
        date: today,
        currentToken: appointments.length > 0 ? Math.max(100, appointments[0].tokenNumber - 1) : 100,
        items: [],
      });
    }

    let modified = false;

    // Auto-sync any existing appointments into queue items if not present
    for (const appt of appointments) {
      const exists = queue.items.some((i) => {
        const itemApptId = i.appointment?._id ? i.appointment._id.toString() : i.appointment?.toString();
        return itemApptId === appt._id.toString() || i.tokenNumber === appt.tokenNumber;
      });

      if (!exists) {
        queue.items.push({
          appointment: appt._id,
          patient: appt.patient?._id || appt.patient,
          tokenNumber: appt.tokenNumber,
          status: appt.status === 'IN_CONSULTATION' ? 'IN_CONSULTATION' : 'WAITING',
          priority: 'ROUTINE',
          checkInTime: new Date(),
        });
        modified = true;
      }
    }

    // Set a sensible current serving token if uninitialized
    if (!queue.currentToken || queue.currentToken === 0) {
      if (queue.items.length > 0) {
        const minToken = Math.min(...queue.items.map((i) => i.tokenNumber));
        queue.currentToken = Math.max(100, minToken - 1);
      } else {
        queue.currentToken = 100;
      }
      modified = true;
    }

    if (modified) {
      await queue.save();
      queue = await Queue.findById(queue._id)
        .populate('items.patient', 'name email phone')
        .populate('items.appointment')
        .populate('facility', 'name type address district');
    }

    res.json(queue);
  } catch (error) {
    next(error);
  }
});

// POST /api/queues/:facilityId/check-in
router.post('/:facilityId/check-in', protect, async (req, res, next) => {
  try {
    const { appointmentId, priority } = req.body;
    const today = new Date().toISOString().split('T')[0];

    let queue = await Queue.findOne({ facility: req.params.facilityId, date: today });
    if (!queue) {
      queue = await Queue.create({
        facility: req.params.facilityId,
        department: 'General Medicine',
        date: today,
        currentToken: 0,
        items: [],
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Check if already in queue
    const exists = queue.items.find((i) => i.appointment.toString() === appointmentId);
    if (exists) {
      return res.json({ message: 'Patient already checked into queue', queue });
    }

    queue.items.push({
      appointment: appointment._id,
      patient: appointment.patient,
      tokenNumber: appointment.tokenNumber,
      status: 'WAITING',
      priority: priority || 'ROUTINE',
      checkInTime: new Date(),
    });

    await queue.save();

    appointment.status = 'IN_QUEUE';
    await appointment.save();

    // Emit Socket.IO queue event
    const io = req.app.get('io');
    if (io) {
      io.to(`facility-${req.params.facilityId}`).emit('queue-updated', {
        facilityId: req.params.facilityId,
        currentToken: queue.currentToken,
        queueItems: queue.items,
      });
    }

    await logAudit(req, 'QUEUE_CHECK_IN', 'Queue', queue._id.toString(), { appointmentId, tokenNumber: appointment.tokenNumber });

    res.json(queue);
  } catch (error) {
    next(error);
  }
});

// POST /api/queues/:facilityId/next
router.post('/:facilityId/next', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const queue = await Queue.findOne({ facility: req.params.facilityId, date: today });
    if (!queue || queue.items.length === 0) {
      return res.status(400).json({ message: 'Queue is empty for today' });
    }

    // Find next waiting patient
    const waitingItem = queue.items.find((i) => i.status === 'WAITING');
    if (!waitingItem) {
      return res.json({ message: 'No more waiting patients in queue', queue });
    }

    // Complete currently in consultation if any
    queue.items.forEach((i) => {
      if (i.status === 'IN_CONSULTATION') i.status = 'COMPLETED';
    });

    waitingItem.status = 'IN_CONSULTATION';
    waitingItem.startTime = new Date();
    queue.currentToken = waitingItem.tokenNumber;

    await queue.save();

    // Update appointment status
    await Appointment.findByIdAndUpdate(waitingItem.appointment, { status: 'IN_CONSULTATION' });

    // Emit Socket.IO queue event
    const io = req.app.get('io');
    if (io) {
      io.to(`facility-${req.params.facilityId}`).emit('queue-updated', {
        facilityId: req.params.facilityId,
        currentToken: queue.currentToken,
        queueItems: queue.items,
      });
    }

    await logAudit(req, 'QUEUE_CALL_NEXT', 'Queue', queue._id.toString(), { activeToken: waitingItem.tokenNumber });

    res.json({ message: `Token #${waitingItem.tokenNumber} called for consultation`, queue, currentItem: waitingItem });
  } catch (error) {
    next(error);
  }
});

// POST /api/queues/:facilityId/call-token (Call a specific token)
router.post('/:facilityId/call-token', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const { tokenNumber } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const queue = await Queue.findOne({ facility: req.params.facilityId, date: today })
      .populate('items.patient', 'name email phone')
      .populate('items.appointment');

    if (!queue) return res.status(404).json({ message: 'Queue not found for today' });

    const targetItem = queue.items.find((i) => i.tokenNumber === parseInt(tokenNumber));
    if (!targetItem) return res.status(404).json({ message: `Token #${tokenNumber} not found in queue` });

    // Set other in consultation to completed or waiting
    queue.items.forEach((i) => {
      if (i.status === 'IN_CONSULTATION' && i.tokenNumber !== targetItem.tokenNumber) {
        i.status = 'COMPLETED';
      }
    });

    targetItem.status = 'IN_CONSULTATION';
    targetItem.startTime = new Date();
    queue.currentToken = targetItem.tokenNumber;

    await queue.save();

    if (targetItem.appointment) {
      await Appointment.findByIdAndUpdate(targetItem.appointment, { status: 'IN_CONSULTATION' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.to(`facility-${req.params.facilityId}`).emit('queue-updated', {
        facilityId: req.params.facilityId,
        currentToken: queue.currentToken,
        queueItems: queue.items,
      });
    }

    await logAudit(req, 'QUEUE_CALL_TOKEN', 'Queue', queue._id.toString(), { tokenNumber });

    res.json({ message: `Token #${tokenNumber} is now IN CONSULTATION`, queue, currentItem: targetItem });
  } catch (error) {
    next(error);
  }
});

// POST /api/queues/:facilityId/complete-token (Complete consultation for a token)
router.post('/:facilityId/complete-token', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const { tokenNumber } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const queue = await Queue.findOne({ facility: req.params.facilityId, date: today });

    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const targetItem = queue.items.find((i) => i.tokenNumber === parseInt(tokenNumber));
    if (!targetItem) return res.status(404).json({ message: `Token #${tokenNumber} not found in queue` });

    targetItem.status = 'COMPLETED';
    targetItem.endTime = new Date();

    await queue.save();

    if (targetItem.appointment) {
      await Appointment.findByIdAndUpdate(targetItem.appointment, { status: 'COMPLETED' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`facility-${req.params.facilityId}`).emit('queue-updated', {
        facilityId: req.params.facilityId,
        currentToken: queue.currentToken,
        queueItems: queue.items,
      });
    }

    await logAudit(req, 'QUEUE_COMPLETE_TOKEN', 'Queue', queue._id.toString(), { tokenNumber });

    res.json({ message: `Token #${tokenNumber} consultation completed`, queue });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
