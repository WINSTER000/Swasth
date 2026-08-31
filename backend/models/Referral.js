const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referringFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    receivingFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    referringHealthWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receivingHealthWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: { type: String, required: true },
    reason: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'EMERGENCY'],
      default: 'ROUTINE',
    },
    clinicalSummary: { type: String, required: true },
    aiSummary: String,
    status: {
      type: String,
      enum: [
        'CREATED',
        'SENT',
        'ACCEPTED',
        'APPOINTMENT_SCHEDULED',
        'PATIENT_ARRIVED',
        'IN_CARE',
        'COMPLETED',
        'FOLLOW_UP_REQUIRED',
        'CLOSED',
      ],
      default: 'SENT',
    },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    followUp: { type: mongoose.Schema.Types.ObjectId, ref: 'FollowUp' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Referral', ReferralSchema);
