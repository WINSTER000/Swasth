const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

const router = express.Router();

// GET /api/notifications
router.get('/', protect, async (req, res, next) => {
  try {
    let notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);

    // Auto-seed realistic initial notifications if empty
    if (notifications.length === 0) {
      if (req.user.role === 'HEALTH_WORKER' || req.user.role === 'ADMIN') {
        await Notification.create([
          {
            user: req.user._id,
            title: 'Inbound Specialist Referral Received',
            message: 'Patient Ramesh Patil has been referred for Cardiology & 2D Echo review from Shirwal PHC.',
            type: 'REFERRAL_CREATED',
            link: '/worker/referrals',
            isRead: false,
            createdAt: new Date(Date.now() - 15 * 60 * 1000),
          },
          {
            user: req.user._id,
            title: 'High-Risk Patient Alert',
            message: 'AI Early Warning flagged Patient Sunita Deshmukh with elevated BP (150/96 mmHg).',
            type: 'RISK_ALERT',
            link: '/worker/ai-risk',
            isRead: false,
            createdAt: new Date(Date.now() - 45 * 60 * 1000),
          },
          {
            user: req.user._id,
            title: 'OPD Queue Check-in',
            message: 'New patient checked into the OPD Queue at your facility. Serving Token #101.',
            type: 'QUEUE_UPDATE',
            link: '/worker/queue',
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        ]);
      } else {
        await Notification.create([
          {
            user: req.user._id,
            title: 'Welcome to SWASTH Digital Health',
            message: 'Your ABHA digital health record is active. Access your clinical timeline and vitals anytime.',
            type: 'SYSTEM',
            link: '/patient/records',
            isRead: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000),
          },
          {
            user: req.user._id,
            title: 'OPD Appointment Confirmed',
            message: 'Your OPD appointment at Mangal Murti Hospital is confirmed. Token #101.',
            type: 'APPOINTMENT_CONFIRMED',
            link: '/patient/appointments',
            isRead: false,
            createdAt: new Date(Date.now() - 10 * 60 * 1000),
          },
        ]);
      }
      notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    }

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications (Create notification and broadcast)
router.post('/', protect, async (req, res, next) => {
  try {
    const { userId, title, message, type, link } = req.body;
    const targetUserId = userId || req.user._id;

    const notification = await Notification.create({
      user: targetUserId,
      title,
      message,
      type: type || 'SYSTEM',
      link: link || '',
      isRead: false,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${targetUserId}`).emit('notification', notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

