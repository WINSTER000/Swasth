const express = require('express');
const Facility = require('../models/Facility');
const MapsService = require('../services/maps/MapsService');

const router = express.Router();

// GET /api/maps/config - Return active Google Maps API Key and provider status
router.get('/config', (req, res) => {
  res.json(MapsService.getConfig());
});

// GET /api/maps/nearby
router.get('/nearby', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat || 17.6868);
    const lng = parseFloat(req.query.lng || 74.0000);

    const facilities = await Facility.find({});
    const results = await MapsService.getNearbyFacilities(lat, lng, facilities);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /api/maps/route
router.get('/route', async (req, res, next) => {
  try {
    const originLat = parseFloat(req.query.originLat || 17.6868);
    const originLng = parseFloat(req.query.originLng || 74.0000);
    const destLat = parseFloat(req.query.destLat || 17.6900);
    const destLng = parseFloat(req.query.destLng || 74.0100);

    const route = await MapsService.getRoute(originLat, originLng, destLat, destLng);
    res.json(route);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
