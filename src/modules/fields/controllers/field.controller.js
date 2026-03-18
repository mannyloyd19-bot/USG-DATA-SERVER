const Collection = require('../../collections/models/collection.model');
const Field = require('../models/field.model');

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

exports.create = async (req, res) => {
  try {
    const { collectionKey } = req.params;
    const { name, key, type, required, uniqueValue, searchable, sortable, defaultValue, options, rules } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const collection = await Collection.findOne({ where: { key: collectionKey } });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const finalKey = normalizeKey(key || name);
    const exists = await Field.findOne({
      where: { collectionId: collection.id, key: finalKey }
    });

    if (exists) {
      return res.status(409).json({ message: 'field key already exists in this collection' });
    }

    const field = await Field.create({
      collectionId: collection.id,
      name,
      key: finalKey,
      type: String(type || 'TEXT').toUpperCase(),
      required: Boolean(required),
      uniqueValue: Boolean(uniqueValue),
      searchable: searchable !== undefined ? Boolean(searchable) : true,
      sortable: sortable !== undefined ? Boolean(sortable) : true,
      defaultValue: defaultValue ?? null,
      options: options ?? null,
      rules: rules ?? null
    });

    return res.status(201).json(field);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create field', error: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const collection = await Collection.findOne({ where: { key: req.params.collectionKey } });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const fields = await Field.findAll({
      where: { collectionId: collection.id },
      order: [['createdAt', 'ASC']]
    });

    return res.json(fields);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch fields', error: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const collection = await Collection.findOne({ where: { key: req.params.collectionKey } });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const field = await Field.findOne({
      where: {
        id: req.params.fieldId,
        collectionId: collection.id
      }
    });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    return res.json(field);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch field', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const collection = await Collection.findOne({ where: { key: req.params.collectionKey } });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const field = await Field.findOne({
      where: {
        id: req.params.fieldId,
        collectionId: collection.id
      }
    });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const allowed = ['name', 'type', 'required', 'uniqueValue', 'searchable', 'sortable', 'defaultValue', 'options', 'rules', 'isActive'];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        field[key] = key === 'type' ? String(req.body[key]).toUpperCase() : req.body[key];
      }
    }

    await field.save();
    return res.json(field);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update field', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const collection = await Collection.findOne({ where: { key: req.params.collectionKey } });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const field = await Field.findOne({
      where: {
        id: req.params.fieldId,
        collectionId: collection.id
      }
    });

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    await field.destroy();
    return res.json({ message: 'Field deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete field', error: error.message });
  }
};
