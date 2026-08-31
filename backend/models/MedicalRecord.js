const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  condition: { type: String, required: true },
  icdCode: String,
  type: { type: String, enum: ['PRIMARY', 'SECONDARY', 'CHRONIC'], default: 'PRIMARY' },
  severity: { type: String, enum: ['MILD', 'MODERATE', 'SEVERE'], default: 'MILD' },
  notes: String,
});

const MedicationItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. 500mg
  frequency: { type: String, required: true }, // e.g. Twice daily after meals
  duration: { type: String, required: true }, // e.g. 5 days
  instructions: String,
});

const PrescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    healthWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    medications: [MedicationItemSchema],
    notes: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const LabReportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    testName: { type: String, required: true },
    category: { type: String, default: 'Hematology' },
    result: { type: String, required: true },
    referenceRange: String,
    unit: String,
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'ABNORMAL'], default: 'COMPLETED' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const EncounterSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    healthWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    chiefComplaints: [{ type: String }],
    vitals: {
      bp: String,
      pulse: Number,
      temp: Number,
      spo2: Number,
      weight: Number,
    },
    diagnoses: [DiagnosisSchema],
    prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
    labReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabReport' }],
    clinicalNotes: String,
    aiSummary: String,
    encounterDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MedicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    encounters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Encounter' }],
    prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
    labReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabReport' }],
  },
  { timestamps: true }
);

module.exports = {
  MedicalRecord: mongoose.model('MedicalRecord', MedicalRecordSchema),
  Encounter: mongoose.model('Encounter', EncounterSchema),
  Prescription: mongoose.model('Prescription', PrescriptionSchema),
  LabReport: mongoose.model('LabReport', LabReportSchema),
};
