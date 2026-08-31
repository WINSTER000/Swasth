const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    healthWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: { type: String, required: true, default: 'General Medicine' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'CONFIRMED',
        'CHECKED_IN',
        'IN_QUEUE',
        'IN_CONSULTATION',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
      ],
      default: 'CONFIRMED',
    },
    appointmentType: {
      type: String,
      enum: ['IN_PERSON', 'TELECONSULT'],
      default: 'IN_PERSON',
    },
    vitals: {
      bp: String,
      pulse: Number,
      temp: Number,
      spo2: Number,
      weight: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
