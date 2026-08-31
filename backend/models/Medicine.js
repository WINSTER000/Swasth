const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    genericName: { type: String, required: true },
    category: { type: String, required: true }, // Antibiotic, Analgesic, Antidiabetic, Antihypertensive, Nutritional
    unit: { type: String, default: 'Tablets' },
    dosageForm: { type: String, default: 'Tablet' },
    description: String,
  },
  { timestamps: true }
);

const MedicineInventorySchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 50 },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK'],
      default: 'AVAILABLE',
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = {
  Medicine: mongoose.model('Medicine', MedicineSchema),
  MedicineInventory: mongoose.model('MedicineInventory', MedicineInventorySchema),
};
