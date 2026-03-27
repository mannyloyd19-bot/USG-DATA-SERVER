const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: attach user properly
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: err.message
    });
  }
};
