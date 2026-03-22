const SavedQuery = require('../models/saved-query.model');
const { executeQuery } = require('../../productionCore/services/query-executor.service');

function safeJsonParse(v, fallback = {}) {
  try { return JSON.parse(v); } catch { return fallback; }
}

exports.listSaved = async (req, res) => {
  try {
    const rows = await SavedQuery.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({
      success: true,
      savedQueries: rows.map(r => {
        const j = r.toJSON();
        return { ...j, queryJson: safeJsonParse(j.queryJson, {}) };
      })
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.save = async (req, res) => {
  try {
    const { name, collectionKey, query } = req.body || {};
    if (!name || !collectionKey) {
      return res.status(400).json({ success: false, message: 'name and collectionKey are required' });
    }

    const row = await SavedQuery.create({
      name,
      collectionKey,
      queryJson: JSON.stringify(query || {})
    });

    return res.json({ success: true, savedQuery: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.execute = async (req, res) => {
  try {
    const { collectionKey, query } = req.body || {};
    const result = await executeQuery({ collectionKey, query: query || {} });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      execution: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    await SavedQuery.destroy({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
