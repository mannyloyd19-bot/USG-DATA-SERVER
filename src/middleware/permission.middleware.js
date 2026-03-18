const Permission = require('../modules/permissions/models/permission.model');

module.exports = function requirePermission(moduleName, actionName) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (req.user.role === 'super_admin') {
        return next();
      }

      const permission = await Permission.findOne({
        where: {
          role: req.user.role,
          module: moduleName,
          action: actionName,
          allowed: true
        }
      });

      if (!permission) {
        return res.status(403).json({
          message: `Forbidden: missing permission ${moduleName}.${actionName}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};
