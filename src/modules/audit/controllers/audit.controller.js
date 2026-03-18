const AuditLog = require('../models/audit-log.model');

exports.findAll = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.module) where.module = req.query.module;
    if (req.query.action) where.action = req.query.action;
    if (req.query.status) where.status = req.query.status;
    if (req.query.username) where.username = req.query.username;
    if (req.query.collectionKey) where.collectionKey = req.query.collectionKey;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return res.json({
      page,
      limit,
      total: count,
      totalPages: Math.max(Math.ceil(count / limit), 1),
      items: rows
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.logId);

    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    return res.json(log);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch audit log',
      error: error.message
    });
  }
};
