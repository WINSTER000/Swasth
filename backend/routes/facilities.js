const express = require('express');
const Facility = require('../models/Facility');
const Department = require('../models/Department');
const Service = require('../models/Service');
const { MedicineInventory } = require('../models/Medicine');
const { FacilityDiagnostic } = require('../models/DiagnosticService');
const MapsService = require('../services/maps/MapsService');
const { protect, authorize } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/facilities
router.get('/', async (req, res, next) => {
  try {
    const { search, type, district } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (type && type !== 'ALL') {
      query.type = type;
    }
    if (district) {
      query.district = { $regex: district, $options: 'i' };
    }

    const facilities = await Facility.find(query);
    res.json(facilities);
  } catch (error) {
    next(error);
  }
});

// GET /api/facilities/nearby
router.get('/nearby', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat || 17.6868); // Satara / Shirwal default coords
    const lng = parseFloat(req.query.lng || 74.0000);

    const allFacilities = await Facility.find({});
    const nearby = await MapsService.getNearbyFacilities(lat, lng, allFacilities);
    res.json(nearby);
  } catch (error) {
    next(error);
  }
});

const mongoose = require('mongoose');
const { ensureClinicalData } = require('../services/maps/LeafletMapsProvider');

// GET /api/facilities/:id
router.get('/:id', async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let facility = null;

    if (mongoose.Types.ObjectId.isValid(idParam)) {
      facility = await Facility.findById(idParam);
    }

    if (!facility) {
      facility = await Facility.findOne({
        $or: [
          { code: idParam },
          { code: idParam.toUpperCase() },
          { name: { $regex: idParam.replace(/[_-]/g, ' '), $options: 'i' } },
        ],
      });
    }

    // If still not found (e.g. legacy/virtual local_phc_near_user, local_chc_near_user, local_dh_near_user)
    if (!facility) {
      const isPhc = idParam.toLowerCase().includes('phc');
      const isChc = idParam.toLowerCase().includes('chc');
      const facType = isPhc ? 'PHC' : isChc ? 'CHC' : 'DISTRICT_HOSPITAL';
      const facName = isPhc
        ? 'Primary Health Centre (PHC Near You)'
        : isChc
        ? 'Community Health Centre (CHC Near You)'
        : 'District General Specialty Hospital';

      facility = await Facility.create({
        name: facName,
        type: facType,
        code: idParam.toUpperCase(),
        district: 'Your Local Health Sector',
        state: 'State',
        address: isPhc
          ? 'Emergency Healthcare Hub, 1.2 km from your location'
          : isChc
          ? 'Main Highway Bypass, 3.4 km from your location'
          : 'Civil Hospital Road, 5.8 km from your location',
        location: { lat: 17.6868, lng: 74.0000 },
        phone: isPhc ? '+91 1800 108 000' : isChc ? '+91 1800 108 001' : '+91 1800 108 002',
        operatingHours: isPhc ? '08:00 AM - 04:00 PM (24x7 Emergency)' : '24x7 Multi-Specialty & ICU',
        totalBeds: isPhc ? 15 : isChc ? 40 : 200,
        availableBeds: isPhc ? 9 : isChc ? 18 : 54,
        icuBeds: isPhc ? 0 : isChc ? 4 : 20,
        queueStatus: isPhc ? 'NORMAL' : isChc ? 'NORMAL' : 'BUSY',
        averageWaitTimeMinutes: isPhc ? 10 : isChc ? 15 : 25,
      });
    }

    // Ensure departments, services, medicines, and diagnostics exist for this facility
    await ensureClinicalData(facility._id, facility.type, facility.name);

    const departments = await Department.find({ facility: facility._id });
    const services = await Service.find({ facility: facility._id });
    const medicines = await MedicineInventory.find({ facility: facility._id }).populate('medicine');
    const diagnostics = await FacilityDiagnostic.find({ facility: facility._id }).populate('diagnosticService');

    res.json({
      facility,
      departments,
      services,
      medicines,
      diagnostics,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/facilities/:id/services
router.get('/:id/services', async (req, res, next) => {
  try {
    const services = await Service.find({ facility: req.params.id }).populate('department');
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// GET /api/facilities/:id/availability
router.get('/:id/availability', async (req, res, next) => {
  try {
    const medicines = await MedicineInventory.find({ facility: req.params.id }).populate('medicine');
    const diagnostics = await FacilityDiagnostic.find({ facility: req.params.id }).populate('diagnosticService');
    const facility = await Facility.findById(req.params.id).select('queueStatus totalBeds availableBeds averageWaitTimeMinutes');

    res.json({
      facility,
      medicines,
      diagnostics,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/facilities/:id (Admin update)
router.patch('/:id', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit(req, 'UPDATE_FACILITY', 'Facility', facility._id.toString());
    res.json(facility);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
