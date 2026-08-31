const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
