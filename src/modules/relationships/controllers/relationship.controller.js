const Relationship = require('../models/relationship.model');
const RelTable = require('../../relational/models/table.model');
const RelColumn = require('../../relational/models/column.model');

async function validateTableAndColumn(tableKey, columnKey) {
  const table = await RelTable.findOne({ where: { key: tableKey } });
  if (!table) {
    throw new Error(`Table not found: ${tableKey}`);
  }

  const column = await RelColumn.findOne({
    where: {
      tableId: table.id,
      key: columnKey
    }
  });

  if (!column) {
    throw new Error(`Column not found: ${tableKey}.${columnKey}`);
  }

  return { table, column };
}

exports.create = async (req, res) => {
  try {
    const {
      name,
      sourceTableKey,
      sourceColumnKey,
      targetTableKey,
      targetColumnKey,
      relationType,
      onDelete,
      description
    } = req.body || {};

    if (!name || !sourceTableKey || !sourceColumnKey || !targetTableKey || !targetColumnKey) {
      return res.status(400).json({
        message: 'name, sourceTableKey, sourceColumnKey, targetTableKey, and targetColumnKey are required'
      });
    }

    await validateTableAndColumn(sourceTableKey, sourceColumnKey);
    await validateTableAndColumn(targetTableKey, targetColumnKey);

    const existing = await Relationship.findOne({
      where: {
        sourceTableKey,
        sourceColumnKey,
        targetTableKey,
        targetColumnKey
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'Relationship already exists' });
    }

    const item = await Relationship.create({
      name,
      sourceTableKey,
      sourceColumnKey,
      targetTableKey,
      targetColumnKey,
      relationType: relationType || 'one_to_many',
      onDelete: onDelete || 'restrict',
      description: description || null
    });

    return res.status(201).json(item);
  } catch (error) {
    const msg = error.message || 'Failed to create relationship';
    if (msg.startsWith('Table not found') || msg.startsWith('Column not found')) {
      return res.status(404).json({ message: msg });
    }
    return res.status(500).json({
      message: 'Failed to create relationship',
      error: msg
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.sourceTableKey) where.sourceTableKey = req.query.sourceTableKey;
    if (req.query.targetTableKey) where.targetTableKey = req.query.targetTableKey;
    if (req.query.relationType) where.relationType = req.query.relationType;

    const items = await Relationship.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch relationships',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Relationship.findByPk(req.params.relationshipId);

    if (!item) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    await item.destroy();
    return res.json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete relationship',
      error: error.message
    });
  }
};
