const crypto = require('crypto');
const ApiKey = require('../models/api-key.model');

function generateApiKey() {
  return 'usg_' + crypto.randomBytes(24).toString('hex');
}

exports.create = async (req, res) => {
  try {
    const { name, role, scopes } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const entry = await ApiKey.create({
      name,
      key: generateApiKey(),
      role: role || 'admin',
      scopes: Array.isArray(scopes) ? scopes : [],
      createdBy: req.user ? req.user.id : null
    });

    return res.status(201).json(entry);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create API key',
      error: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const items = await ApiKey.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch API keys',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await ApiKey.findByPk(req.params.apiKeyId);

    if (!item) {
      return res.status(404).json({ message: 'API key not found' });
    }

    const { name, role, isActive, scopes } = req.body;

    if (name !== undefined) item.name = name;
    if (role !== undefined) item.role = role;
    if (isActive !== undefined) item.isActive = Boolean(isActive);
    if (scopes !== undefined) item.scopes = Array.isArray(scopes) ? scopes : item.scopes;

    await item.save();
    return res.json(item);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update API key',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await ApiKey.findByPk(req.params.apiKeyId);

    if (!item) {
      return res.status(404).json({ message: 'API key not found' });
    }

    await item.destroy();
    return res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete API key',
      error: error.message
    });
  }
};
