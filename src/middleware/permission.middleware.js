const Permission = require('../modules/permissions/models/permission.model');

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function hasApiKeyScope(scopes, moduleName, action) {
  const list = Array.isArray(scopes) ? scopes : [];

  return (
    list.includes(`${moduleName}.${action}`) ||
    list.includes(`${moduleName}.*`) ||
    list.includes(`*.${action}`) ||
    list.includes(`*.*`) ||
    list.includes(`admin`) ||
    list.includes(`super_admin`)
  );
}

module.exports = function requirePermission(moduleName, action) {
  return async function (req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          requestId: req.requestId || null
        });
      }

      // API key scope enforcement
      if (req.authType === 'api_key' && req.apiKey) {
        const scopes = safeJsonParse(req.apiKey.scopes, []);
        const normalizedAction =
          action === 'update' ? 'write' :
          action === 'create' ? 'write' :
          action === 'delete' ? 'delete' :
          action === 'read' ? 'read' :
          action;

        const allowed =
          hasApiKeyScope(scopes, moduleName, action) ||
          hasApiKeyScope(scopes, moduleName, normalizedAction);

        if (!allowed) {
          return res.status(403).json({
            success: false,
            message: `Forbidden: API key lacks scope ${moduleName}.${action}`,
            requestId: req.requestId || null
          });
        }

        return next();
      }

      // JWT user permission enforcement
      const role = req.user.role;

      // super_admin shortcut
      if (role === 'super_admin') {
        return next();
      }

      const permission = await Permission.findOne({
        where: {
          role,
          module: moduleName,
          action
        }
      });

      if (permission && permission.allowed) {
        return next();
      }

      // Fallback shortcut for admin if permission row not yet seeded
      if (role === 'admin') {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        requestId: req.requestId || null
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message,
        requestId: req.requestId || null
      });
    }
  };
};
