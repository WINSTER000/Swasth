const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');
const Facility = require('../models/Facility');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notification/NotificationService');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/followups
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'PATIENT') {
      query.patient = req.user._id;
    } else if (req.user.role === 'HEALTH_WORKER' || req.user.role === 'ADMIN') {
      if (req.query.facilityId) query.facility = req.query.facilityId;
      if (req.query.priority) query.priority = req.query.priority;
    }

    if (req.query.status) query.status = req.query.status;

    let followups = await FollowUp.find(query)
      .populate('patient', 'name email phone district address')
      .populate('facility', 'name type district address phone')
      .populate('responsibleHealthWorker', 'name')
      .sort({ date: 1, createdAt: -1 });

    // Auto-seed follow-ups if empty
    if (followups.length === 0 && req.user.role !== 'PATIENT') {
      const patient = await User.findOne({ role: 'PATIENT' });
      const facility = await Facility.findOne({});
      if (patient && facility) {
        await FollowUp.create([
          {
            patient: patient._id,
            facility: facility._id,
            responsibleHealthWorker: req.user._id,
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            reason: 'Post-referral blood pressure surveillance and medication titration review',
            priority: 'PRIORITY',
            notes: 'Patient advised to record daily BP and maintain low-sodium diet.',
            status: 'PENDING',
          },
          {
            patient: patient._id,
            facility: facility._id,
            responsibleHealthWorker: req.user._id,
            date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            reason: 'Repeat lipid profile and cardiovascular risk review',
            priority: 'ROUTINE',
            notes: 'Follow-up on statin therapy and fasting lipid levels.',
            status: 'PENDING',
          },
        ]);
        followups = await FollowUp.find(query)
          .populate('patient', 'name email phone district address')
          .populate('facility', 'name type district address phone')
          .populate('responsibleHealthWorker', 'name')
          .sort({ date: 1, createdAt: -1 });
      }
    }

    res.json(followups);
  } catch (error) {
    next(error);
  }
});

// POST /api/followups (Health worker or Patient creates follow-up)
router.post('/', protect, async (req, res, next) => {
  try {
    const { patientId, facilityId, date, reason, priority, notes, riskAssessmentId } = req.body;
    const actualPatientId = req.user.role === 'PATIENT' ? req.user._id : (patientId || req.user._id);

    let targetFacilityId = facilityId;
    if (!targetFacilityId) {
      const defaultFac = await Facility.findOne({});
      targetFacilityId = defaultFac?._id;
    }

    const followup = await FollowUp.create({
      patient: actualPatientId,
      responsibleHealthWorker: req.user.role === 'HEALTH_WORKER' ? req.user._id : null,
      facility: targetFacilityId,
      date: date ? new Date(date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      reason: reason || 'Post-Consultation Health Check',
      priority: priority || 'ROUTINE',
      notes: notes || '',
      riskAssessment: riskAssessmentId || null,
      status: 'PENDING',
    });

    const populatedFollowup = await FollowUp.findById(followup._id)
      .populate('patient', 'name email phone')
      .populate('facility', 'name type');

    // Notify Patient
    const notif = await Notification.create({
      user: actualPatientId,
      title: 'Health Follow-up Scheduled',
      message: `A health follow-up has been scheduled for ${new Date(followup.date).toLocaleDateString()}. Reason: ${reason}`,
      type: 'FOLLOWUP_REMINDER',
      link: '/patient/followups',
      isRead: false,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${actualPatientId}`).emit('notification', notif);
      io.to(`user-${actualPatientId}`).emit('followup-created', populatedFollowup);
    }

    await logAudit(req, 'CREATE_FOLLOWUP', 'FollowUp', followup._id.toString(), { patientId: actualPatientId, priority });

    res.status(201).json(populatedFollowup);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/followups/:id
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const followup = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name email phone')
      .populate('facility', 'name type')
      .populate('responsibleHealthWorker', 'name');

    if (!followup) return res.status(404).json({ message: 'FollowUp not found' });

    if (req.body.status === 'COMPLETED' && followup.patient?._id) {
      const notif = await Notification.create({
        user: followup.patient._id,
        title: 'Health Follow-up Completed',
        message: `Your scheduled follow-up for "${followup.reason}" has been marked as completed by your doctor.`,
        type: 'SYSTEM',
        link: '/patient/followups',
        isRead: false,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user-${followup.patient._id}`).emit('notification', notif);
      }
    }

    await logAudit(req, 'UPDATE_FOLLOWUP', 'FollowUp', followup._id.toString(), { status: followup.status });
    res.json(followup);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/followups/:id/toggle (Toggle completed/pending status)
router.patch('/:id/toggle', protect, async (req, res, next) => {
  try {
    const followup = await FollowUp.findById(req.params.id)
      .populate('patient', 'name email phone');
    if (!followup) return res.status(404).json({ message: 'FollowUp not found' });

    followup.status = followup.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await followup.save();

    await logAudit(req, 'TOGGLE_FOLLOWUP_STATUS', 'FollowUp', followup._id.toString(), { newStatus: followup.status });
    res.json(followup);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

