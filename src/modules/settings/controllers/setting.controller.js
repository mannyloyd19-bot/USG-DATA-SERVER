const Setting = require('../models/setting.model');

const DEFAULT_SETTINGS = [
  {
    key: 'app.name',
    value: 'USG DATA SERVER',
    group: 'general',
    label: 'Application Name',
    description: 'Primary system name'
  },
  {
    key: 'app.company',
    value: 'USG',
    group: 'general',
    label: 'Company Name',
    description: 'Company or organization name'
  },
  {
    key: 'system.mode',
    value: process.env.NODE_ENV || 'development',
    group: 'system',
    label: 'System Mode',
    description: 'Current runtime environment'
  },
  {
    key: 'security.master_setup_enabled',
    value: true,
    group: 'security',
    label: 'Master Setup Enabled',
    description: 'Allows bootstrap actions with master setup key'
  }
];

exports.seedDefaults = async () => {
  for (const item of DEFAULT_SETTINGS) {
    await Setting.findOrCreate({
      where: { key: item.key },
      defaults: item
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const items = await Setting.findAll({
      order: [['group', 'ASC'], ['key', 'ASC']]
    });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

exports.findGrouped = async (req, res) => {
  try {
    const items = await Setting.findAll({
      order: [['group', 'ASC'], ['key', 'ASC']]
    });

    const grouped = {};
    for (const item of items) {
      if (!grouped[item.group]) grouped[item.group] = [];
      grouped[item.group].push(item);
    }

    return res.json(grouped);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch grouped settings',
      error: error.message
    });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { key, value, group, label, description, isPublic } = req.body || {};

    if (!key) {
      return res.status(400).json({ message: 'Setting key is required' });
    }

    const [item] = await Setting.findOrCreate({
      where: { key },
      defaults: {
        key,
        value: value ?? null,
        group: group || 'general',
        label: label || key,
        description: description || null,
        isPublic: Boolean(isPublic)
      }
    });

    if (value !== undefined) item.value = value;
    if (group !== undefined) item.group = group;
    if (label !== undefined) item.label = label;
    if (description !== undefined) item.description = description;
    if (isPublic !== undefined) item.isPublic = Boolean(isPublic);

    await item.save();
    return res.json(item);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to save setting',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Setting.findByPk(req.params.settingId);

    if (!item) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    await item.destroy();
    return res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete setting',
      error: error.message
    });
  }
};

exports.systemInfo = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        nodeEnv: process.env.NODE_ENV || 'development',
        dbDialect: process.env.DB_DIALECT || 'sqlite',
        port: process.env.PORT || '3000',
        jwtConfigured: Boolean(process.env.JWT_SECRET),
        masterSetupConfigured: Boolean(process.env.MASTER_SETUP_KEY),
        productionMode: (process.env.NODE_ENV || 'development') === 'production'
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load system info',
      error: error.message
    });
  }
};
