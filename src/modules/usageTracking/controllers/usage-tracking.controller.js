const UsageEvent = require('../models/usage-event.model');
const { Op, fn, col } = require('sequelize');

exports.summary = async (req, res) => {
  try {
    const totalRequests = await UsageEvent.count().catch(() => 0);
    const failedRequests = await UsageEvent.count({
      where: { statusCode: { [Op.gte]: 400 } }
    }).catch(() => 0);

    const byRoute = await UsageEvent.findAll({
      attributes: ['route', [fn('COUNT', col('id')), 'count']],
      group: ['route'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    }).catch(() => []);

    const byDomain = await UsageEvent.findAll({
      attributes: ['domainId', [fn('COUNT', col('id')), 'count']],
      group: ['domainId'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    }).catch(() => []);

    return res.json({
      success: true,
      summary: {
        totalRequests,
        failedRequests,
        activeDomains: byDomain.length
      },
      topRoutes: byRoute,
      topDomains: byDomain
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
