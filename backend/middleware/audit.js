const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, resource, resourceId = null, details = null) => {
  try {
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      role: req.user ? req.user.role : 'ANONYMOUS',
      action,
      resource,
      resourceId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
    });
  } catch (error) {
    console.error(`[AuditLog Error] Failed to write audit record: ${error.message}`);
  }
};

module.exports = { logAudit };
