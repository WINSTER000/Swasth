const mongoose = require('mongoose');

const HealthWorkerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    designation: { type: String, required: true }, // Medical Officer, Specialist Doctor, ASHA Worker, ANM, Staff Nurse
    specialization: { type: String, default: 'General Medicine' },
    department: { type: String, default: 'OPD' },
    licenseNumber: { type: String },
    qualifications: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthWorkerProfile', HealthWorkerProfileSchema);
