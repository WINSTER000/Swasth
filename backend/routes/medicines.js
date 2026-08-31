const express = require('express');
const { Medicine, MedicineInventory } = require('../models/Medicine');
const { protect, authorize } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/medicines
router.get('/', async (req, res, next) => {
  try {
    const medicines = await Medicine.find({}).sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    next(error);
  }
});

// GET /api/medicines/facility/:facilityId
router.get('/facility/:facilityId', async (req, res, next) => {
  try {
    const Facility = require('../models/Facility');
    const { ensureClinicalData } = require('../services/maps/LeafletMapsProvider');

    const facility = await Facility.findById(req.params.facilityId);
    if (facility) {
      await ensureClinicalData(facility._id, facility.type, facility.name);
    }

    const inventory = await MedicineInventory.find({ facility: req.params.facilityId })
      .populate('medicine')
      .sort({ 'medicine.name': 1 });

    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/medicines/inventory/:inventoryId (Hospital admin updates medicine stock)
router.patch('/inventory/:inventoryId', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { stockQuantity, availabilityStatus, lowStockThreshold } = req.body;
    const inventory = await MedicineInventory.findById(req.params.inventoryId).populate('medicine');
    if (!inventory) return res.status(404).json({ message: 'Medicine inventory item not found' });

    if (stockQuantity !== undefined) inventory.stockQuantity = stockQuantity;
    if (lowStockThreshold !== undefined) inventory.lowStockThreshold = lowStockThreshold;
    if (availabilityStatus) {
      inventory.availabilityStatus = availabilityStatus;
    } else {
      if (inventory.stockQuantity <= 0) inventory.availabilityStatus = 'OUT_OF_STOCK';
      else if (inventory.stockQuantity <= inventory.lowStockThreshold) inventory.availabilityStatus = 'LIMITED';
      else inventory.availabilityStatus = 'AVAILABLE';
    }

    inventory.lastUpdated = new Date();
    await inventory.save();

    await logAudit(req, 'UPDATE_MEDICINE_INVENTORY', 'MedicineInventory', inventory._id.toString(), {
      medicine: inventory.medicine.name,
      stockQuantity: inventory.stockQuantity,
    });

    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
