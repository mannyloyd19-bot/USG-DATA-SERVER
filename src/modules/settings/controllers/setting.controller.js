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

exports.findOne = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const where = { id: req.params.id, tenantId: tenantId ? tenantId : null };

    const item = await Setting.findOne({ where });
    if (!item) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load setting',
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

exports.update = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const where = { id: req.params.id, tenantId: tenantId ? tenantId : null };

    const item = await Setting.findOne({ where });
    if (!item) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    const { key, group, label, description, value } = req.body || {};

    if (key !== undefined) item.key = key;
    if (group !== undefined) item.group = group || null;
    if (label !== undefined) item.label = label || null;
    if (description !== undefined) item.description = description || null;
    if (value !== undefined) item.value = parseValue(value);

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update setting',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const where = { id: req.params.id, tenantId: tenantId ? tenantId : null };

    const item = await Setting.findOne({ where });
    if (!item) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    await item.destroy();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete setting',
      error: error.message
    });
  }
};

exports.seedDefaults = async () => {
  const defaults = [
    {
      tenantId: null,
      key: 'app.name',
      group: 'general',
      label: 'Application Name',
      description: 'Default application name',
      value: 'NexaCore'
    },
    {
      tenantId: null,
      key: 'app.theme',
      group: 'general',
      label: 'Theme',
      description: 'Default UI theme',
      value: 'light'
    },
    {
      tenantId: null,
      key: 'security.releaseLockdown',
      group: 'security',
      label: 'Release Lockdown',
      description: 'Default release lockdown flag',
      value: false
    }
  ];

  for (const item of defaults) {
    const exists = await Setting.findOne({
      where: {
        tenantId: item.tenantId,
        key: item.key
      }
    });

    if (!exists) {
      await Setting.create(item);
    }
  }

  return true;
};
