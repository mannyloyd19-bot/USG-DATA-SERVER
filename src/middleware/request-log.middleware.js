const { pushLog } = require('../modules/diagnostics/services/log-buffer.service');

module.exports = function requestLogMiddleware(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    pushLog('request', `${req.method} ${req.originalUrl}`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    });
  });

  next();
};
