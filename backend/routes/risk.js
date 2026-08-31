const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const RiskAssessment = require('../models/RiskAssessment');
const FollowUp = require('../models/FollowUp');
const HealthWorkerProfile = require('../models/HealthWorkerProfile');
const NotificationService = require('../services/notification/NotificationService');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/risk-assessments/patient/:id
router.get('/patient/:id', protect, async (req, res, next) => {
  try {
    const assessments = await RiskAssessment.find({ patient: req.params.id })
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    next(error);
  }
});

// GET /api/risk-assessments/high-risk (For Health Worker & Admin dashboards)
router.get('/high-risk', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const assessments = await RiskAssessment.find({
      finalRiskLevel: { $in: ['HIGH', 'CRITICAL'] },
    })
      .populate('patient', 'name email phone')
      .populate('reviewedBy', 'name')
      .sort({ updatedAt: -1 });

    res.json(assessments);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/risk-assessments/:id/review (Health Worker reviews AI risk output)
router.patch('/:id/review', protect, authorize('HEALTH_WORKER', 'ADMIN'), async (req, res, next) => {
  try {
    const { decision, finalRiskLevel, recommendedAction } = req.body; // ACCEPT, MODIFY, REJECT
    const assessment = await RiskAssessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'Risk assessment not found' });

    assessment.healthWorkerDecision = decision;
    assessment.finalRiskLevel = finalRiskLevel || assessment.aiRiskLevel;
    if (recommendedAction) assessment.recommendedAction = recommendedAction;
    assessment.reviewedBy = req.user._id;
    assessment.reviewedAt = new Date();

    await assessment.save();

    // If confirmed HIGH or CRITICAL, automatically create/update Priority FollowUp & Notification
    if (['HIGH', 'CRITICAL'].includes(assessment.finalRiskLevel) && decision !== 'REJECT') {
      const workerProfile = await HealthWorkerProfile.findOne({ user: req.user._id });
      const facilityId = workerProfile ? workerProfile.facility : null;

      if (facilityId) {
        await FollowUp.create({
          patient: assessment.patient,
          responsibleHealthWorker: req.user._id,
          facility: facilityId,
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          reason: `High Risk Health Surveillance (${assessment.finalRiskLevel} Level)`,
          priority: assessment.finalRiskLevel === 'CRITICAL' ? 'URGENT' : 'PRIORITY',
          notes: assessment.recommendedAction,
          riskAssessment: assessment._id,
          status: 'PENDING',
        });
      }

      await NotificationService.send({
        userId: assessment.patient,
        title: 'Priority Health Alert',
        message: 'Your care team has flagged a high-priority health follow-up. Please check your follow-ups.',
        type: 'RISK_ALERT',
        link: '/patient/followups',
      });
    }

    await logAudit(req, 'REVIEW_RISK_ASSESSMENT', 'RiskAssessment', assessment._id.toString(), {
      decision,
      finalRiskLevel: assessment.finalRiskLevel,
    });

    res.json(assessment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
