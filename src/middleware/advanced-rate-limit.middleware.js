const bucket = new Map();

module.exports = function advancedRateLimit(req, res, next) {
  const key = [
    req.ip || 'unknown',
    req.usg?.domainId || 'public',
    req.method,
    req.path
  ].join(':');

  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxHits = 120;

  if (!bucket.has(key)) {
    bucket.set(key, []);
  }

  const recent = bucket.get(key).filter(ts => now - ts < windowMs);
  recent.push(now);
  bucket.set(key, recent);

  if (recent.length > maxHits) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded'
    });
  }

  next();
};
