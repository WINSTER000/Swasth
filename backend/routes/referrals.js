const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Referral = require('../models/Referral');
const Appointment = require('../models/Appointment');
const NotificationService = require('../services/notification/NotificationService');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// POST /api/referrals (Health worker or Patient creates referral)
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      patientId,
      referringFacilityId,
      receivingFacilityId,
      department,
      reason,
      urgency,
      clinicalSummary,
      aiSummary,
    } = req.body;

    const actualPatientId = req.user.role === 'PATIENT' ? req.user._id : (patientId || req.user._id);

    const referral = await Referral.create({
      patient: actualPatientId,
      referringFacility: referringFacilityId,
      receivingFacility: receivingFacilityId,
      referringHealthWorker: req.user.role === 'HEALTH_WORKER' ? req.user._id : null,
      department: department || 'General Medicine',
      reason: reason || 'Specialist Evaluation and Secondary Care',
      urgency: urgency || 'ROUTINE',
      clinicalSummary: clinicalSummary || 'Referral request for advanced clinical evaluation and diagnostics.',
      aiSummary: aiSummary || '',
      status: 'SENT',
    });

    // Notify Patient if created by health worker
    if (req.user.role !== 'PATIENT') {
      await NotificationService.send({
        userId: actualPatientId,
        title: 'New Medical Referral Issued',
        message: `Your health worker has referred you to a specialist. Reason: ${reason}`,
        type: 'REFERRAL_CREATED',
        link: '/patient/referrals',
      });
    }

    await logAudit(req, 'CREATE_REFERRAL', 'Referral', referral._id.toString(), { patientId: actualPatientId, receivingFacilityId });

    res.status(201).json(referral);
  } catch (error) {
    next(error);
  }
});

// GET /api/referrals
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'PATIENT') {
      query.patient = req.user._id;
    } else if (req.user.role === 'HEALTH_WORKER' || req.user.role === 'ADMIN') {
      const facilityId = req.query.facilityId;
      if (facilityId) {
        query.$or = [{ referringFacility: facilityId }, { receivingFacility: facilityId }];
      }
    }

    if (req.query.status) query.status = req.query.status;

    const referrals = await Referral.find(query)
      .populate('patient', 'name email phone')
      .populate('referringFacility', 'name type district')
      .populate('receivingFacility', 'name type district phone')
      .populate('referringHealthWorker', 'name')
      .populate('receivingHealthWorker', 'name')
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (error) {
    next(error);
  }
});

// GET /api/referrals/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('referringFacility', 'name type address phone location')
      .populate('receivingFacility', 'name type address phone location')
      .populate('referringHealthWorker', 'name')
      .populate('receivingHealthWorker', 'name')
      .populate('appointment');

    if (!referral) return res.status(404).json({ message: 'Referral not found' });
    res.json(referral);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/referrals/:id/status (Accept / Confirm referral, schedule appointment, complete referral)
router.patch('/:id/status', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const { status, appointmentDate, time } = req.body;
    const referral = await Referral.findById(req.params.id)
      .populate('receivingFacility', 'name type')
      .populate('referringFacility', 'name type')
      .populate('patient', 'name email');

    if (!referral) return res.status(404).json({ message: 'Referral not found' });

    referral.status = status || 'ACCEPTED';
    referral.receivingHealthWorker = req.user._id;

    const Notification = require('../models/Notification');
    const receivingName = referral.receivingFacility?.name || 'Specialist Hospital';
    const referringName = referral.referringFacility?.name || 'Primary Centre';
    const patientName = referral.patient?.name || 'Patient';

    if (status === 'ACCEPTED' || status === 'CONFIRMED' || status === 'APPOINTMENT_SCHEDULED') {
      const scheduledDate = appointmentDate ? new Date(appointmentDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const tokenNo = Math.floor(Math.random() * 50) + 201;

      // Automatically create appointment at receiving facility
      const appointment = await Appointment.create({
        patient: referral.patient?._id || referral.patient,
        facility: referral.receivingFacility?._id || referral.receivingFacility,
        healthWorker: req.user._id,
        department: referral.department || 'General Medicine',
        date: scheduledDate,
        time: time || '10:30 AM',
        reason: `Specialist Referral: ${referral.reason}`,
        tokenNumber: tokenNo,
        status: 'CONFIRMED',
      });

      referral.appointment = appointment._id;
      referral.status = 'ACCEPTED';

      // 1. Notify Patient
      const patientNotif = await Notification.create({
        user: referral.patient?._id || referral.patient,
        title: 'Specialist Referral Confirmed & Token Generated',
        message: `Dr. ${req.user.name} has confirmed your specialist referral to ${receivingName}. Your OPD appointment token is #${tokenNo} for ${scheduledDate.toLocaleDateString()}.`,
        type: 'REFERRAL_ACCEPTED',
        link: '/patient/referrals',
        isRead: false,
      });

      // 2. Notify Referring Health Worker if different
      if (referral.referringHealthWorker && referral.referringHealthWorker.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: referral.referringHealthWorker,
          title: 'Specialist Referral Accepted',
          message: `Your referral of ${patientName} to ${receivingName} has been confirmed by Dr. ${req.user.name}.`,
          type: 'REFERRAL_ACCEPTED',
          link: '/worker/referrals',
          isRead: false,
        });
      }

      // Socket.IO Emit Real-time
      const io = req.app.get('io');
      if (io) {
        const patientIdStr = (referral.patient?._id || referral.patient).toString();
        io.to(`user-${patientIdStr}`).emit('notification', patientNotif);
        io.to(`user-${patientIdStr}`).emit('referral-updated', {
          referralId: referral._id,
          status: referral.status,
          receivingFacility: receivingName,
          tokenNumber: tokenNo,
        });
      }
    }

    await referral.save();

    await logAudit(req, 'UPDATE_REFERRAL_STATUS', 'Referral', referral._id.toString(), {
      newStatus: referral.status,
      patientId: referral.patient?._id,
    });

    res.json(referral);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
