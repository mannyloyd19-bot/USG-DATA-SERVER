const IndexModel = require('../models/index.model');

function safeParse(value, fallback = []) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.collectionKey) where.collectionKey = req.query.collectionKey;

    const rows = await IndexModel.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      indexes: rows.map(item => {
        const json = item.toJSON();
        return {
          ...json,
          fields: safeParse(json.fields, [])
        };
      })
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      collectionKey,
      indexName,
      fields,
      uniqueIndex,
      notes
    } = req.body || {};

    if (!collectionKey || !indexName) {
      return res.status(400).json({
        success: false,
        message: 'collectionKey and indexName are required'
      });
    }

    const item = await IndexModel.create({
      collectionKey,
      indexName,
      fields: JSON.stringify(Array.isArray(fields) ? fields : []),
      uniqueIndex: !!uniqueIndex,
      status: 'active',
      notes: notes || null
    });

    const json = item.toJSON();
    return res.json({
      success: true,
      index: {
        ...json,
        fields: safeParse(json.fields, [])
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await IndexModel.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Index not found' });
    }

    const payload = req.body || {};
    if (payload.collectionKey !== undefined) item.collectionKey = payload.collectionKey;
    if (payload.indexName !== undefined) item.indexName = payload.indexName;
    if (payload.fields !== undefined) item.fields = JSON.stringify(Array.isArray(payload.fields) ? payload.fields : []);
    if (payload.uniqueIndex !== undefined) item.uniqueIndex = !!payload.uniqueIndex;
    if (payload.status !== undefined) item.status = payload.status || 'active';
    if (payload.notes !== undefined) item.notes = payload.notes || null;

    await item.save();

    const json = item.toJSON();
    return res.json({
      success: true,
      index: {
        ...json,
        fields: safeParse(json.fields, [])
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    await IndexModel.destroy({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
