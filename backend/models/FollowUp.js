const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    responsibleHealthWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'DUE', 'COMPLETED', 'MISSED', 'RESCHEDULED'],
      default: 'PENDING',
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'PRIORITY', 'URGENT'],
      default: 'ROUTINE',
    },
    notes: String,
    reminderSent: { type: Boolean, default: false },
    riskAssessment: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskAssessment' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', FollowUpSchema);
