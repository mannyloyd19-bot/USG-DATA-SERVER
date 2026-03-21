const ApiKeyLog = require('../models/api-key-log.model');

exports.findAll = async (req, res) => {
  try {
    const rows = await ApiKeyLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 300
    });
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch API key logs',
      error: error.message
    });
  }
};
