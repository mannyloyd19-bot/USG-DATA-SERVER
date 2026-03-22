const { getAppLogs, pushAppLog } = require('../services/app-log.service');
const App = require('../../apps/models/app.model');

exports.list = async (req, res) => {
  try {
    return res.json({ success: true, logs: getAppLogs() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.testLog = async (req, res) => {
  try {
    const payload = req.body || {};
    pushAppLog(payload.level || 'info', payload.message || 'Manual app log', payload.meta || null);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.appsSummary = async (req, res) => {
  try {
    const rows = await App.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({
      success: true,
      apps: rows.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        status: item.status,
        runtimeStatus: item.runtimeStatus || item.status || 'unknown',
        healthStatus: item.healthStatus || 'unknown',
        port: item.port || null,
        updatedAt: item.updatedAt,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
