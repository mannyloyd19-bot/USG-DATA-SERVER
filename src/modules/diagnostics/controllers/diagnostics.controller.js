const { getLogs, pushLog } = require('../services/log-buffer.service');
const { getDiagnostics } = require('../services/diagnostics.service');

exports.logs = async (req, res) => {
  try {
    return res.json({ success: true, logs: getLogs() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.diagnostics = async (req, res) => {
  try {
    const data = await getDiagnostics();
    return res.json({ success: true, diagnostics: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.testLog = async (req, res) => {
  try {
    const payload = req.body || {};
    pushLog(payload.level || 'info', payload.message || 'Test log entry', payload.meta || null);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
