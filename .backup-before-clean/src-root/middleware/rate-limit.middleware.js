const rateLimit = {};

module.exports = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimit[ip]) {
    rateLimit[ip] = [];
  }

  rateLimit[ip] = rateLimit[ip].filter(t => now - t < 60000);

  if (rateLimit[ip].length > 100) {
    return res.status(429).json({ success: false, message: 'Too many requests' });
  }

  rateLimit[ip].push(now);
  next();
};
