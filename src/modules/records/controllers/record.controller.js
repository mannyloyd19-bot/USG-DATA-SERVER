const Record = require('../models/record.model');
const Collection = require('../../collections/models/collection.model');

function normalizePayload(payload = {}) {
  return payload && typeof payload === 'object' ? payload : {};
}

exports.list = async (req, res) => {
  try {
    const rows = await Record.findAll({
      order: [['createdAt', 'DESC']]
    });

    const filtered = req.rls?.applyTenantFilter ? req.rls.applyTenantFilter(rows) : rows;
    return res.json({ success: true, records: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = normalizePayload(req.body || {});
    const data = normalizePayload(payload.data || {});

    if (!payload.collectionId) {
      return res.status(400).json({ success: false, message: 'collectionId is required' });
    }

    const collection = await Collection.findByPk(payload.collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const securedData = req.rls?.applyTenantPayload ? req.rls.applyTenantPayload(data) : data;

    const item = await Record.create({
      collectionId: payload.collectionId,
      data: securedData,
      meta: payload.meta || {}
    });

    return res.json({ success: true, record: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Record.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const itemTenantId = item.tenantId ?? item.data?.tenantId ?? null;
    if (req.rls?.tenantId && String(itemTenantId || '') !== String(req.rls.tenantId)) {
      return res.status(403).json({ success: false, message: 'Tenant isolation blocked this update' });
    }

    const payload = normalizePayload(req.body || {});
    const nextData = normalizePayload(payload.data !== undefined ? payload.data : item.data || {});
    const securedData = req.rls?.applyTenantPayload ? req.rls.applyTenantPayload(nextData) : nextData;

    if (payload.collectionId !== undefined) {
      const collection = await Collection.findByPk(payload.collectionId);
      if (!collection) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      item.collectionId = payload.collectionId;
    }

    item.data = securedData;
    if (payload.isDeleted !== undefined) item.isDeleted = payload.isDeleted;
    if (payload.deletedAt !== undefined) item.deletedAt = payload.deletedAt;
    if (payload.meta !== undefined) item.meta = payload.meta;

    await item.save();
    return res.json({ success: true, record: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Record.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const itemTenantId = item.tenantId ?? item.data?.tenantId ?? null;
    if (req.rls?.tenantId && String(itemTenantId || '') !== String(req.rls.tenantId)) {
      return res.status(403).json({ success: false, message: 'Tenant isolation blocked this delete' });
    }

    await item.destroy();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
