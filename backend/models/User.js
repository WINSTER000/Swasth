const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['PATIENT', 'HEALTH_WORKER', 'ADMIN'],
      required: true,
    },
    adminLevel: {
      type: String,
      enum: ['HOSPITAL', 'GOVERNMENT'],
      default: 'HOSPITAL',
    },
    phone: { type: String, trim: true },
    languagePreference: {
      type: String,
      enum: ['en', 'hi', 'mr'],
      default: 'en',
    },
    // Verification & Proof details for Doctors and Staff
    licenseNumber: { type: String, default: '' },
    proofDocumentUrl: { type: String, default: '' },
    adminAuthCode: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'NOT_REQUIRED'],
      default: 'NOT_REQUIRED',
    },
    avatarUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
