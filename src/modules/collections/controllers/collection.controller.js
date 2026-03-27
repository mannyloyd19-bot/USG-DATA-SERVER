const validation = require('../../../core/utils/validation');
const Collection = require('../models/collection.model');
const { emitCrudEvent } = require('../../eventTriggers/services/event-trigger.service');

function normalize(value = '') {
  return String(value || '').trim();
}

function toBool(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

exports.list = async (req, res) => {
  try {
    const rows = await Collection.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ success: true, collections: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    const finalName = normalize(payload.name);
    const finalKey = normalize(payload.key);
    const finalDescription = normalize(payload.description);
    const finalSchemaMode = normalize(payload.schemaMode || 'strict') || 'strict';
    const finalIsActive = toBool(payload.isActive, true);

    const errors = validation.collect(
      validation.required(finalName, 'Collection Name'),
      validation.minLength(finalName, 'Collection Name', 2),
      validation.required(finalKey, 'Collection Key'),
      validation.minLength(finalKey, 'Collection Key', 2)
    );

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const existing = await Collection.findOne({ where: { key: finalKey } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'key already exists' });
    }

    const item = await Collection.create({
      name: finalName,
      key: finalKey,
      description: finalDescription || null,
      schemaMode: finalSchemaMode,
      isActive: finalIsActive
    });

    emitCrudEvent({
      module: 'collections',
      action: 'created',
      recordId: item.id,
      data: item.toJSON()
    });

    return res.json({ success: true, collection: item, message: 'Collection created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Collection.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const payload = req.body || {};
    const finalName = normalize(payload.name ?? item.name);
    const finalKey = normalize(payload.key ?? item.key);
    const finalDescription = normalize(payload.description ?? item.description);
    const finalSchemaMode = normalize(payload.schemaMode ?? item.schemaMode || 'strict') || 'strict';
    const finalIsActive = payload.isActive === undefined ? item.isActive : toBool(payload.isActive, true);

    const errors = validation.collect(
      validation.required(finalName, 'Collection Name'),
      validation.minLength(finalName, 'Collection Name', 2),
      validation.required(finalKey, 'Collection Key'),
      validation.minLength(finalKey, 'Collection Key', 2)
    );

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const existing = await Collection.findOne({ where: { key: finalKey } });
    if (existing && String(existing.id) !== String(item.id)) {
      return res.status(400).json({ success: false, message: 'key already exists' });
    }

    item.name = finalName;
    item.key = finalKey;
    item.description = finalDescription || null;
    item.schemaMode = finalSchemaMode;
    item.isActive = finalIsActive;
    await item.save();

    emitCrudEvent({
      module: 'collections',
      action: 'updated',
      recordId: item.id,
      data: item.toJSON()
    });

    return res.json({ success: true, collection: item, message: 'Collection updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Collection.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    await item.destroy();

    emitCrudEvent({
      module: 'collections',
      action: 'deleted',
      recordId: req.params.id,
      data: { id: req.params.id }
    });

    return res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
