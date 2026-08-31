const mongoose = require('mongoose');

const QueueItemSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['WAITING', 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED'],
      default: 'WAITING',
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'EMERGENCY'],
      default: 'ROUTINE',
    },
    checkInTime: { type: Date, default: Date.now },
    startTime: Date,
    endTime: Date,
  },
  { _id: true }
);

const QueueSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    department: { type: String, required: true, default: 'General Medicine' },
    date: { type: String, required: true }, // YYYY-MM-DD
    currentToken: { type: Number, default: 0 },
    items: [QueueItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Queue', QueueSchema);
