const mongoose = require('mongoose');

const RiskAssessmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    encounter: { type: mongoose.Schema.Types.ObjectId, ref: 'Encounter' },
    aiRiskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    riskFactors: [{ type: String }],
    warningSignals: [{ type: String }],
    recommendedAction: { type: String, required: true },
    followUpPriority: {
      type: String,
      enum: ['ROUTINE', 'PRIORITY', 'URGENT'],
      default: 'ROUTINE',
    },
    aiConfidence: { type: Number, default: 0.88 }, // 0 to 1 scale
    provider: { type: String, default: 'MockAIProvider' },
    healthWorkerDecision: {
      type: String,
      enum: ['PENDING', 'ACCEPT', 'MODIFY', 'REJECT'],
      default: 'PENDING',
    },
    finalRiskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    disclaimer: {
      type: String,
      default: 'AI-assisted assessment requiring professional review.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiskAssessment', RiskAssessmentSchema);
