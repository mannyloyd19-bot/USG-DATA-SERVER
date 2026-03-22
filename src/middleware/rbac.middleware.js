const { userHasPermission } = require('../modules/rbac/services/rbac.service');

function resolveUserId(req) {
  return req.user?.id || req.auth?.id || req.headers['x-user-id'] || null;
}

function requirePermission(permissionKey) {
  return async function(req, res, next) {
    try {
      const userId = resolveUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not resolved' });
      }

      const ok = await userHasPermission(userId, permissionKey);
      if (!ok) {
        return res.status(403).json({
          success: false,
          message: `Missing permission: ${permissionKey}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

module.exports = {
  requirePermission
};
