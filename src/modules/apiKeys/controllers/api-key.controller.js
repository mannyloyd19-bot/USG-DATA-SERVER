const validation = require('../../../core/utils/validation');
const crypto = require('crypto');
const ApiKey = require('../models/api-key.model');
const { emitCrudEvent } = require('../../eventTriggers/services/event-trigger.service');

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
    return { keyType: 'sk', environment: 'live' };
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
  return req.tenantContext?.tenantId || req.tenant?.id || null;
}

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    const errors = validation.collect(
      validation.required(payload.name, 'Key Name'),
      validation.minLength(payload.name, 'Key Name', 2)
    );

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const finalKeyType = (payload.keyType || 'sk').toLowerCase();
    const finalEnv = (payload.environment || 'live').toLowerCase();

    if (!['pk', 'sk'].includes(finalKeyType)) {
      return res.status(400).json({ success: false, message: 'Invalid keyType' });
    }

    if (!['live', 'test'].includes(finalEnv)) {
      return res.status(400).json({ success: false, message: 'Invalid environment' });
    }

    const rawKey = buildFormattedKey({
      keyType: finalKeyType,
      environment: finalEnv
    });

    const item = await ApiKey.create({
      tenantId: getTenantId(req),
      name: payload.name,
      role: payload.role || 'admin',
      purpose: payload.purpose || null,
      owner: payload.owner || null,
      expiresAt: payload.expiresAt || null,
      status: payload.status || 'active',
      key: rawKey,
      scopes: JSON.stringify(Array.isArray(payload.scopes) ? payload.scopes : []),
      ipWhitelist: JSON.stringify(Array.isArray(payload.ipWhitelist) ? payload.ipWhitelist : []),
      usageCount: 0
    });

    emitCrudEvent({
      module: 'apiKeys',
      action: 'created',
      recordId: item.id,
      data: item.toJSON()
    });

    return res.status(201).json({
      success: true,
      key: toPayload(item),
      rawKey
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
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

    return res.json({
      success: true,
      keys: items.map(toPayload)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch API keys',
      error: error.message
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const where = { id: req.params.id, ...(tenantId ? { tenantId } : { tenantId: null }) };

    const item = await ApiKey.findOne({ where });
    if (!item) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    const { status } = req.body || {};
    if (!['active', 'disabled', 'revoked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    item.status = status;
    await item.save();

    emitCrudEvent({
      module: 'apiKeys',
      action: 'statusUpdated',
      recordId: item.id,
      data: item.toJSON()
    });

    return res.json({
      success: true,
      message: 'API key status updated',
      key: toPayload(item)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update API key status',
      error: error.message
    });
  }
};

exports.rotate = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const where = { id: req.params.id, ...(tenantId ? { tenantId } : { tenantId: null }) };

    const item = await ApiKey.findOne({ where });
    if (!item) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    const meta = inferKeyMeta(item.key);
    const newRawKey = buildFormattedKey(meta);

    item.key = newRawKey;
    item.status = 'active';
    await item.save();

    emitCrudEvent({
      module: 'apiKeys',
      action: 'rotated',
      recordId: item.id,
      data: item.toJSON()
    });

    return res.json({
      success: true,
      message: 'API key rotated successfully',
      key: toPayload(item),
      rawKey: newRawKey
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to rotate API key',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const where = { id: req.params.id, ...(tenantId ? { tenantId } : { tenantId: null }) };

    const item = await ApiKey.findOne({ where });
    if (!item) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    const payload = req.body || {};
    if (payload.name !== undefined) item.name = payload.name;
    if (payload.status !== undefined) item.status = payload.status;
    if (payload.role !== undefined) item.role = payload.role;
    if (payload.purpose !== undefined) item.purpose = payload.purpose;
    if (payload.owner !== undefined) item.owner = payload.owner;
    if (payload.expiresAt !== undefined) item.expiresAt = payload.expiresAt;
    if (payload.scopes !== undefined) item.scopes = JSON.stringify(Array.isArray(payload.scopes) ? payload.scopes : []);
    if (payload.ipWhitelist !== undefined) item.ipWhitelist = JSON.stringify(Array.isArray(payload.ipWhitelist) ? payload.ipWhitelist : []);

    await item.save();

    emitCrudEvent({
      module: 'apiKeys',
      action: 'updated',
      recordId: item.id,
      data: item.toJSON()
    });

    return res.json({ success: true, key: toPayload(item) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const where = { id: req.params.id, ...(tenantId ? { tenantId } : { tenantId: null }) };

    const item = await ApiKey.findOne({ where });
    if (!item) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    await item.destroy();

    emitCrudEvent({
      module: 'apiKeys',
      action: 'deleted',
      recordId: req.params.id,
      data: { id: req.params.id }
    });

    return res.json({ success: true, message: 'API key deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
