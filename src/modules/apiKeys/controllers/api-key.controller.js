const crypto = require('crypto');
const ApiKey = require('../models/api-key.model');

function maskKey(value = '') {
  if (!value) return '';
  if (value.length <= 8) return value;
  return value.slice(0, 4) + '••••••••' + value.slice(-4);
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function toPayload(item) {
  const json = item.toJSON();
  return {
    ...json,
    maskedKey: maskKey(json.key),
    scopes: safeJsonParse(json.scopes, []),
    ipWhitelist: safeJsonParse(json.ipWhitelist, [])
  };
}

exports.create = async (req, res) => {
  try {
    const { name, role, purpose, owner, expiresAt, scopes, ipWhitelist } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const rawKey = crypto.randomBytes(24).toString('hex');

    const item = await ApiKey.create({
      name,
      role: role || 'admin',
      purpose: purpose || null,
      owner: owner || null,
      expiresAt: expiresAt || null,
      status: 'active',
      key: rawKey,
      scopes: JSON.stringify(Array.isArray(scopes) ? scopes : []),
      ipWhitelist: JSON.stringify(Array.isArray(ipWhitelist) ? ipWhitelist : []),
      usageCount: 0
    });

    return res.status(201).json({
      ...toPayload(item),
      rawKey
    });
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

    return res.json(items.map(toPayload));
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch API keys',
      error: error.message
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const item = await ApiKey.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'API key not found' });
    }

    const { status } = req.body || {};
    if (!['active', 'disabled', 'revoked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    item.status = status;
    await item.save();

    return res.json({
      message: 'API key status updated',
      item: toPayload(item)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update API key status',
      error: error.message
    });
  }
};

exports.rotate = async (req, res) => {
  try {
    const item = await ApiKey.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'API key not found' });
    }

    const newRawKey = crypto.randomBytes(24).toString('hex');
    item.key = newRawKey;
    item.status = 'active';
    await item.save();

    return res.json({
      message: 'API key rotated successfully',
      item: toPayload(item),
      rawKey: newRawKey
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to rotate API key',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await ApiKey.findByPk(req.params.id);
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
