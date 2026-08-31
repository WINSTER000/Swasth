const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const Facility = require('../models/Facility');
const NotificationService = require('../services/notification/NotificationService');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// POST /api/appointments
router.post('/', protect, async (req, res, next) => {
  try {
    const { facilityId, department, date, time, reason, appointmentType, healthWorkerId } = req.body;

    const patientId = req.user.role === 'PATIENT' ? req.user._id : req.body.patientId;
    if (!patientId) return res.status(400).json({ message: 'Patient ID is required' });

    const User = require('../models/User');
    const Notification = require('../models/Notification');

    const patientUser = await User.findById(patientId);

    // Calculate token number for the facility & date
    const dateStr = new Date(date).toISOString().split('T')[0];
    const existingCount = await Appointment.countDocuments({
      facility: facilityId,
      date: {
        $gte: new Date(`${dateStr}T00:00:00.000Z`),
        $lte: new Date(`${dateStr}T23:59:59.999Z`),
      },
    });

    const tokenNumber = existingCount + 101;

    const appointment = await Appointment.create({
      patient: patientId,
      facility: facilityId,
      healthWorker: healthWorkerId || null,
      department: department || 'General Medicine',
      date: new Date(date),
      time: time || '09:30 AM',
      reason: reason || 'OPD Health Checkup',
      tokenNumber,
      appointmentType: appointmentType || 'IN_PERSON',
      status: 'IN_QUEUE',
    });

    // Auto-sync into Queue collection for this facility and date
    let queue = await Queue.findOne({ facility: facilityId, date: dateStr });
    if (!queue) {
      queue = await Queue.create({
        facility: facilityId,
        department: department || 'General Medicine',
        date: dateStr,
        currentToken: Math.max(100, tokenNumber - 1),
        items: [],
      });
    }

    queue.items.push({
      appointment: appointment._id,
      patient: patientId,
      tokenNumber,
      status: 'WAITING',
      priority: 'ROUTINE',
      checkInTime: new Date(),
    });

    await queue.save();

    const facility = await Facility.findById(facilityId);

    // Broadcast live queue & appointment updates via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`facility-${facilityId}`).emit('queue-updated', {
        facilityId,
        currentToken: queue.currentToken,
        queueItems: queue.items,
      });
      io.to(`facility-${facilityId}`).emit('appointment-created', {
        facilityId,
        appointment,
      });
      io.emit('global-appointment-created', {
        facilityId,
        appointment,
      });
    }

    // 1. Notify Patient
    await NotificationService.send({
      userId: patientId,
      title: 'Appointment Booked',
      message: `Your appointment at ${facility?.name || 'Healthcare Centre'} is confirmed for ${dateStr} at ${time}. Token #${tokenNumber}.`,
      type: 'APPOINTMENT_CONFIRMATION',
      link: '/patient/appointments',
    });

    // 2. Notify Health Workers & Doctors
    const doctorUsers = await User.find({ role: { $in: ['HEALTH_WORKER', 'ADMIN'] } });
    for (const doc of doctorUsers) {
      await Notification.create({
        user: doc._id,
        title: 'New Patient Appointment Booked',
        message: `Patient ${patientUser?.name || 'Patient'} booked Token #${tokenNumber} for ${department || 'General Medicine'} at ${facility?.name || 'your hospital'}.`,
        type: 'APPOINTMENT_CONFIRMED',
        link: '/worker/queue',
        isRead: false,
      });
      if (io) {
        io.to(`user-${doc._id}`).emit('notification', {
          title: 'New Patient Appointment Booked',
          message: `Patient ${patientUser?.name || 'Patient'} booked Token #${tokenNumber}.`,
        });
      }
    }

    await logAudit(req, 'BOOK_APPOINTMENT', 'Appointment', appointment._id.toString());

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

// GET /api/appointments
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'PATIENT') {
      query.patient = req.user._id;
    } else if (req.user.role === 'HEALTH_WORKER') {
      // Health workers see appointments for their facility/department
      if (req.query.facilityId) query.facility = req.query.facilityId;
    } else if (req.user.role === 'ADMIN') {
      if (req.query.facilityId) query.facility = req.query.facilityId;
    }

    if (req.query.date) {
      const dateStr = req.query.date;
      query.date = {
        $gte: new Date(`${dateStr}T00:00:00.000Z`),
        $lte: new Date(`${dateStr}T23:59:59.999Z`),
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('facility', 'name type district')
      .populate('healthWorker', 'name')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

// GET /api/appointments/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('facility', 'name type address phone location')
      .populate('healthWorker', 'name');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/appointments/:id
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await logAudit(req, 'UPDATE_APPOINTMENT', 'Appointment', appointment._id.toString(), { status: appointment.status });
    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = 'CANCELLED';
    await appointment.save();

    await logAudit(req, 'CANCEL_APPOINTMENT', 'Appointment', appointment._id.toString());
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
