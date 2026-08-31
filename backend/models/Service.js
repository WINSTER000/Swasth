const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', ServiceSchema);
