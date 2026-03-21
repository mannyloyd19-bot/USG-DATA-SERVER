const validation = require('../../../core/utils/validation');
const crypto = require('crypto');
const ApiKey = require('../models/api-key.model');

function maskKey(value = '') {
  if (!value) return '';
  if (value.length <= 12) return value;
  return value.slice(0, 10) + '••••••••' + value.slice(-6);
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function inferKeyMeta(fullKey = '') {
  const m = /^usg_(pk|sk)_(live|test)_(.+)$/i.exec(fullKey);
  if (!m) {
    return {
      keyType: 'sk',
      environment: 'live'
    };
  }

  return {
    keyType: m[1].toLowerCase(),
    environment: m[2].toLowerCase()
  };
}

function toPayload(item) {
  const json = item.toJSON();
  const meta = inferKeyMeta(json.key);

  return {
    ...json,
    ...meta,
    maskedKey: maskKey(json.key),
    scopes: safeJsonParse(json.scopes, []),
    ipWhitelist: safeJsonParse(json.ipWhitelist, [])
  };
}

function buildFormattedKey({ keyType = 'sk', environment = 'live' }) {
  const random = crypto.randomBytes(24).toString('hex');
  return `usg_${keyType}_${environment}_${random}`;
}

function getTenantId(req) {
  return req.tenantContext?.tenantId || null;
}

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    const errors = validation.collect(
      validation.required(payload.name, 'Key Name'),
      validation.minLength(payload.name, 'Key Name', 2),
      validation.required(payload.scope, 'Scope'),
      validation.minLength(payload.scope, 'Scope', 1),
      validation.required(payload.status, 'Status'),
      validation.minLength(payload.status, 'Status', 1)
    );
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const {
      name,
      role,
      purpose,
      owner,
      expiresAt,
      scopes,
      ipWhitelist,
      keyType,
      environment
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const finalKeyType = (keyType || 'sk').toLowerCase();
    const finalEnv = (environment || 'live').toLowerCase();

    if (!['pk', 'sk'].includes(finalKeyType)) {
      return res.status(400).json({ message: 'Invalid keyType' });
    }

    if (!['live', 'test'].includes(finalEnv)) {
      return res.status(400).json({ message: 'Invalid environment' });
    }

    const rawKey = buildFormattedKey({
      keyType: finalKeyType,
      environment: finalEnv
    });

    const item = await ApiKey.create({
      tenantId: getTenantId(req),
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
    const tenantId = getTenantId(req);
    const where = tenantId ? { tenantId } : { tenantId: null };

    const items = await ApiKey.findAll({
      where,
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
    const tenantId = getTenantId(req);
    const where = { id: req.params.id };
    if (tenantId) where.tenantId = tenantId;
    else where.tenantId = null;

    const item = await ApiKey.findOne({ where });
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
    const tenantId = getTenantId(req);
    const where = { id: req.params.id };
    if (tenantId) where.tenantId = tenantId;
    else where.tenantId = null;

    const item = await ApiKey.findOne({ where });
    if (!item) {
      return res.status(404).json({ message: 'API key not found' });
    }

    const meta = inferKeyMeta(item.key);
    const newRawKey = buildFormattedKey(meta);

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
    const tenantId = getTenantId(req);
    const where = { id: req.params.id };
    if (tenantId) where.tenantId = tenantId;
    else where.tenantId = null;

    const item = await ApiKey.findOne({ where });
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


exports.update = async (req, res) => {
  try {
    const ApiKey = require('../models/api-key.model');
    const item = await ApiKey.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    const payload = req.body || {};
    if (payload.name !== undefined) item.name = payload.name;
    if (payload.scope !== undefined) item.scope = payload.scope;
    if (payload.status !== undefined) item.status = payload.status;

    await item.save();
    return res.json({ success: true, key: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const ApiKey = require('../models/api-key.model');
    await ApiKey.destroy({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'API key deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
