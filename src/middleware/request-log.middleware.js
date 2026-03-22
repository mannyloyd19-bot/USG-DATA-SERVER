const { pushLog } = require('../modules/diagnostics/services/log-buffer.service');
const { pushAppLog } = require('../modules/appLogs/services/app-log.service');

module.exports = function requestLogMiddleware(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const meta = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    };

    pushLog('request', `${req.method} ${req.originalUrl}`, meta);
    pushAppLog('request', `${req.method} ${req.originalUrl}`, meta);
  });

  next();
};
