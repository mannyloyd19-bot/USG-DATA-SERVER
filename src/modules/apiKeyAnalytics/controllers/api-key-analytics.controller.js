const ApiKey = require('../../apiKeys/models/api-key.model');
const ApiKeyLog = require('../../apiKeyLogs/models/api-key-log.model');
const { fn, col } = require('sequelize');

exports.summary = async (req, res) => {
  try {
    const requests = await ApiKeyLog.count().catch(() => 0);
    const failures = await ApiKeyLog.count({
      where: { statusCode: { [require('sequelize').Op.gte]: 400 } }
    }).catch(() => 0);
    const keys = await ApiKey.count().catch(() => 0);

    const topRoutes = await ApiKeyLog.findAll({
      attributes: ['route', [fn('COUNT', col('id')), 'count']],
      group: ['route'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    }).catch(() => []);

    const topKeys = await ApiKeyLog.findAll({
      attributes: ['keyName', [fn('COUNT', col('id')), 'count']],
      group: ['keyName'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    }).catch(() => []);

    return res.json({
      success: true,
      summary: {
        requests,
        failures,
        keys,
        routes: topRoutes.length
      },
      topRoutes,
      topKeys
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
