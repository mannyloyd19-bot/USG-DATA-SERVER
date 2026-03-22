const { buildRuntimeSummary, getDbHealth } = require('../services/system-monitoring.service');
const Collection = require('../../collections/models/collection.model');
const User = require('../../users/models/user.model');
const Domain = require('../../domains/models/domain.model');
const File = require('../../files/models/file.model');
const ApiKey = require('../../apiKeys/models/api-key.model');
const { getRecentEvents } = require('../../realtimeCore/services/realtime-bus.service');

async function safeCount(model) {
  try {
    return await model.count();
  } catch {
    return 0;
  }
}

exports.health = async (req, res) => {
  try {
    const db = await getDbHealth();
    return res.json({
      success: true,
      status: db.status === 'online' ? 'healthy' : 'degraded',
      checks: {
        database: db
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.metrics = async (req, res) => {
  try {
    const runtime = await buildRuntimeSummary();
    const db = await getDbHealth();

    const [users, collections, domains, files, apiKeys] = await Promise.all([
      safeCount(User),
      safeCount(Collection),
      safeCount(Domain),
      safeCount(File),
      safeCount(ApiKey)
    ]);

    return res.json({
      success: true,
      runtime,
      services: {
        database: db
      },
      counts: {
        users,
        collections,
        domains,
        files,
        apiKeys
      },
      events: (getRecentEvents() || []).slice(0, 10)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.runtime = async (req, res) => {
  try {
    const runtime = await buildRuntimeSummary();
    return res.json({ success: true, runtime });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
