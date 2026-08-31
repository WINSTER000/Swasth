const express = require('express');
const AIService = require('../services/ai/AIService');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const { MedicalRecord, Encounter } = require('../models/MedicalRecord');
const FollowUp = require('../models/FollowUp');
const RiskAssessment = require('../models/RiskAssessment');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// POST /api/ai/assistant (Patient AI assistant)
router.post('/assistant', protect, async (req, res, next) => {
  try {
    const { message, language } = req.body;
    const userLang = language || req.user.languagePreference || 'en';

    const aiResult = await AIService.getAssistantResponse({
      message,
      language: userLang,
      patientContext: { userId: req.user._id, name: req.user.name },
    });

    await logAudit(req, 'AI_ASSISTANT_QUERY', 'AIService', null, { queryLength: message.length });

    res.json(aiResult);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/triage (Health Worker Digital Triage Tool)
router.post('/triage', protect, async (req, res, next) => {
  try {
    const { symptoms, vitals, history, language } = req.body;
    const userLang = language || req.user.languagePreference || 'en';

    const triageResult = await AIService.runDigitalTriage({
      symptoms: symptoms || [],
      vitals: vitals || {},
      history: history || '',
      language: userLang,
    });

    await logAudit(req, 'AI_DIGITAL_TRIAGE', 'AIService', null, { urgency: triageResult.urgency });

    res.json(triageResult);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/summarize (Health Worker AI Clinical Summary)
router.post('/summarize', protect, async (req, res, next) => {
  try {
    const { patientId, language } = req.body;
    const userLang = language || req.user.languagePreference || 'en';

    const patient = await User.findById(patientId);
    const record = await MedicalRecord.findOne({ patient: patientId }).populate('encounters');

    const summaryResult = await AIService.generateRecordSummary({
      encounters: record ? record.encounters : [],
      patientName: patient ? patient.name : 'Patient',
      language: userLang,
    });

    await logAudit(req, 'AI_CLINICAL_SUMMARY', 'AIService', patientId);

    res.json(summaryResult);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/referral-summary
router.post('/referral-summary', protect, async (req, res, next) => {
  try {
    const { patientId, reason, vitals, language } = req.body;
    const userLang = language || req.user.languagePreference || 'en';

    const patient = await User.findById(patientId);

    const refSummary = await AIService.generateReferralSummary({
      patientName: patient ? patient.name : 'Patient',
      reason,
      vitals,
      language: userLang,
    });

    res.json(refSummary);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/risk-assessment (AI Early Warning Risk Detection)
router.post('/risk-assessment', protect, async (req, res, next) => {
  try {
    const { patientId, vitals, encounterId } = req.body;

    const patientUser = await User.findById(patientId);
    const profile = await PatientProfile.findOne({ user: patientId });
    const record = await MedicalRecord.findOne({ patient: patientId }).populate('encounters');
    const missedFollowups = await FollowUp.countDocuments({ patient: patientId, status: 'MISSED' });

    const aiAssessment = await AIService.analyzePatientRisk({
      patientProfile: profile,
      encounters: record ? record.encounters : [],
      vitals: vitals || {},
      missedFollowupsCount: missedFollowups,
    });

    // Save as unconfirmed/pending RiskAssessment document
    const riskDoc = await RiskAssessment.create({
      patient: patientId,
      encounter: encounterId || null,
      aiRiskLevel: aiAssessment.aiRiskLevel,
      riskFactors: aiAssessment.riskFactors,
      warningSignals: aiAssessment.warningSignals,
      recommendedAction: aiAssessment.recommendedAction,
      followUpPriority: aiAssessment.followUpPriority,
      aiConfidence: aiAssessment.aiConfidence,
      provider: 'MockAIProvider',
      healthWorkerDecision: 'PENDING',
      finalRiskLevel: aiAssessment.aiRiskLevel,
    });

    await logAudit(req, 'AI_RISK_ASSESSMENT_GENERATED', 'RiskAssessment', riskDoc._id.toString(), {
      aiRiskLevel: riskDoc.aiRiskLevel,
    });

    res.status(201).json({ assessment: riskDoc, aiDetails: aiAssessment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
