const mongoose = require('mongoose');

const PatientProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    dateOfBirth: { type: Date, required: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], default: 'O+' },
    address: {
      street: String,
      villageOrCity: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true, default: 'Maharashtra' },
      pincode: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    primaryFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);
