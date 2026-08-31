const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'APPOINTMENT_CONFIRMATION',
        'APPOINTMENT_REMINDER',
        'QUEUE_UPDATE',
        'REFERRAL_CREATED',
        'REFERRAL_ACCEPTED',
        'REFERRAL_UPDATED',
        'FOLLOWUP_REMINDER',
        'RISK_ALERT',
        'MEDICINE_UPDATE',
        'DIAGNOSTIC_UPDATE',
        'EMERGENCY_ALERT',
        'SYSTEM_ALERT',
      ],
      required: true,
    },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
