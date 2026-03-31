const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Missing token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 RBAC-ready user object
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      token,

      // TEMP PERMISSIONS (Wave 9)
      permissions:
        decoded.role === 'super_admin'
          ? ['*']
          : decoded.role === 'admin'
          ? [
              'users.read','users.write',
              'collections.read','collections.write',
              'records.read','records.write',
              'files.read','files.write',
              'webhooks.read','webhooks.write',
              'billing.read','billing.write'
            ]
          : [
              'users.read',
              'collections.read',
              'records.read',
              'files.read'
            ]
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
