const UsageEvent = require('../modules/usageTracking/models/usage-event.model');

module.exports = function usageTracker(req, res, next) {
  res.on('finish', async () => {
    try {
      await UsageEvent.create({
        domainId: req.usg?.domainId || null,
        tenantId: req.tenant?.id || null,
        eventType: 'api_request',
        route: req.originalUrl || req.url,
        method: req.method,
        statusCode: res.statusCode,
        units: 1
      });
    } catch (error) {
      console.error('[usageTracker] error:', error.message);
    }
  });

  next();
};
