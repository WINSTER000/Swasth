const express = require('express');
const { DiagnosticService, FacilityDiagnostic } = require('../models/DiagnosticService');
const { protect, authorize } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/diagnostics
router.get('/', async (req, res, next) => {
  try {
    const services = await DiagnosticService.find({}).sort({ name: 1 });
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// GET /api/diagnostics/facility/:facilityId
router.get('/facility/:facilityId', async (req, res, next) => {
  try {
    const Facility = require('../models/Facility');
    const { ensureClinicalData } = require('../services/maps/LeafletMapsProvider');

    const facility = await Facility.findById(req.params.facilityId);
    if (facility) {
      await ensureClinicalData(facility._id, facility.type, facility.name);
    }

    const diagnostics = await FacilityDiagnostic.find({ facility: req.params.facilityId })
      .populate('diagnosticService')
      .sort({ 'diagnosticService.name': 1 });

    res.json(diagnostics);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/diagnostics/facility-diagnostic/:id (Admin updates diagnostic status)
router.patch('/facility-diagnostic/:id', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { availabilityStatus, estimatedReportTimeHours, priceInINR } = req.body;
    const diagnostic = await FacilityDiagnostic.findById(req.params.id).populate('diagnosticService');
    if (!diagnostic) return res.status(404).json({ message: 'Facility diagnostic item not found' });

    if (availabilityStatus) diagnostic.availabilityStatus = availabilityStatus;
    if (estimatedReportTimeHours !== undefined) diagnostic.estimatedReportTimeHours = estimatedReportTimeHours;
    if (priceInINR !== undefined) diagnostic.priceInINR = priceInINR;

    await diagnostic.save();

    await logAudit(req, 'UPDATE_FACILITY_DIAGNOSTIC', 'FacilityDiagnostic', diagnostic._id.toString(), {
      diagnostic: diagnostic.diagnosticService.name,
      status: diagnostic.availabilityStatus,
    });

    res.json(diagnostic);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
