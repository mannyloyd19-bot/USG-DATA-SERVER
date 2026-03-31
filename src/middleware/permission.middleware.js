module.exports = function requirePermission(permission) {
  return function (req, res, next) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (user.permissions && user.permissions.includes('*')) {
        return next();
      }

      if (!user.permissions || !user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: missing permission ' + permission
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  };
};
