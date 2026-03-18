const Collection = require('../models/collection.model');

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

exports.create = async (req, res) => {
  try {
    const { name, key, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const finalKey = normalizeKey(key || name);

    if (!finalKey) {
      return res.status(400).json({ message: 'invalid collection key' });
    }

    const existing = await Collection.findOne({
      where: {
        key: finalKey
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'collection key already exists' });
    }

    const collection = await Collection.create({
      name,
      key: finalKey,
      description: description || null
    });

    return res.status(201).json(collection);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create collection', error: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const collections = await Collection.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.json(collections);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch collections', error: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const { key } = req.params;

    const collection = await Collection.findOne({ where: { key } });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.json(collection);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch collection', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { key } = req.params;
    const { name, description, isActive } = req.body;

    const collection = await Collection.findOne({ where: { key } });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isActive !== undefined) collection.isActive = isActive;

    await collection.save();

    return res.json(collection);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update collection', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { key } = req.params;

    const collection = await Collection.findOne({ where: { key } });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await collection.destroy();

    return res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete collection', error: error.message });
  }
};
