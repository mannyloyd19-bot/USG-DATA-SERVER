const AuditLog = require('../models/audit-log.model');

exports.writeLog = async ({
  req = null,
  user = null,
  module = 'system',
  action = 'unknown',
  entityType = null,
  entityId = null,
  collectionKey = null,
  status = 'success',
  message = null,
  beforeData = null,
  afterData = null,
  metadata = null
}) => {
  try {
    await AuditLog.create({
      userId: user && user.id ? user.id : null,
      username: user && user.username ? user.username : null,
      role: user && user.role ? user.role : null,
      module,
      action,
      entityType,
      entityId,
      collectionKey,
      status,
      message,
      requestMethod: req ? req.method : null,
      requestPath: req ? req.originalUrl : null,
      ipAddress: req ? (req.ip || req.headers['x-forwarded-for'] || null) : null,
      userAgent: req ? (req.headers['user-agent'] || null) : null,
      beforeData,
      afterData,
      metadata
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};
