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
  if (!m) return { keyType: 'sk', environment: 'live' };
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

    const rawKey = buildFormattedKey(payload);

    const item = await ApiKey.create({
      tenantId: getTenantId(req),
      name: payload.name,
      role: payload.role || 'admin',
      purpose: payload.purpose || null,
      owner: payload.owner || null,
      expiresAt: payload.expiresAt || null,
      status: 'active',
      key: rawKey,
      scopes: JSON.stringify(payload.scopes || []),
      ipWhitelist: JSON.stringify(payload.ipWhitelist || []),
      usageCount: 0
    });

    emitCrudEvent({
      module: 'apiKeys',
      action: 'created',
      recordId: item.id,
      data: item.toJSON()
    });

    return res.json({ success: true, key: toPayload(item), rawKey });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const items = await ApiKey.findAll({
      where: tenantId ? { tenantId } : { tenantId: null },
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, keys: items.map(toPayload) });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const item = await ApiKey.findOne({
      where: { id: req.params.id, ...(tenantId ? { tenantId } : { tenantId: null }) }
    });

    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    Object.assign(item, req.body);
    await item.save();

    emitCrudEvent({
      module: 'apiKeys',
      action: 'updated',
      recordId: item.id,
      data: item.toJSON()
    });

    return res.json({ success: true, key: toPayload(item) });

  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const item = await ApiKey.findOne({
      where: { id: req.params.id, ...(tenantId ? { tenantId } : { tenantId: null }) }
    });

    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    await item.destroy();

    emitCrudEvent({
      module: 'apiKeys',
      action: 'deleted',
      recordId: req.params.id,
      data: { id: req.params.id }
    });

    return res.json({ success: true });

  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
