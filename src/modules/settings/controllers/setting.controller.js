const Setting = require('../models/setting.model');

function parseValue(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function getTenantId(req) {
  return req.tenantContext?.tenantId || null;
}

exports.findAll = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const where = tenantId ? { tenantId } : { tenantId: null };

    const rows = await Setting.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load settings',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { key, group, label, description, value } = req.body || {};

    if (!key) {
      return res.status(400).json({ message: 'key is required' });
    }

    const item = await Setting.create({
      tenantId,
      key,
      group: group || null,
      label: label || null,
      description: description || null,
      value: parseValue(value)
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to save setting',
      error: error.message
    });
  }
};
