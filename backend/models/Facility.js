const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['PHC', 'CHC', 'SUB_CENTRE', 'DISTRICT_HOSPITAL', 'TERTIARY_CARE'],
      required: true,
    },
    code: { type: String, unique: true },
    district: { type: String, required: true },
    state: { type: String, required: true, default: 'Maharashtra' },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    phone: { type: String },
    operatingHours: { type: String, default: '08:00 AM - 05:00 PM (24x7 Emergency)' },
    totalBeds: { type: Number, default: 10 },
    availableBeds: { type: Number, default: 6 },
    icuBeds: { type: Number, default: 2 },
    emergencyContact: { type: String },
    queueStatus: {
      type: String,
      enum: ['NORMAL', 'BUSY', 'OVERLOADED'],
      default: 'NORMAL',
    },
    averageWaitTimeMinutes: { type: Number, default: 25 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facility', FacilitySchema);
