const mongoose = require('mongoose');

const DiagnosticServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // CBC, X-Ray, Ultrasound, ECG, Blood Glucose
    code: String,
    category: { type: String, default: 'Pathology' },
    description: String,
  },
  { timestamps: true }
);

const FacilityDiagnosticSchema = new mongoose.Schema(
  {
    diagnosticService: { type: mongoose.Schema.Types.ObjectId, ref: 'DiagnosticService', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'LIMITED', 'UNAVAILABLE'],
      default: 'AVAILABLE',
    },
    estimatedReportTimeHours: { type: Number, default: 2 },
    priceInINR: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

module.exports = {
  DiagnosticService: mongoose.model('DiagnosticService', DiagnosticServiceSchema),
  FacilityDiagnostic: mongoose.model('FacilityDiagnostic', FacilityDiagnosticSchema),
};
