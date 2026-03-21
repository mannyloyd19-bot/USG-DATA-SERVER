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

function isWriteLikeAction(action) {
  return ['create', 'update', 'write', 'delete', 'revoke', 'rotate', 'run'].includes(String(action || '').toLowerCase());
}

function isSecretOnlyModule(moduleName) {
  return [
    'settings',
    'release',
    'api_keys',
    'permissions',
    'backups',
    'db_migration',
    'audit_logs'
  ].includes(String(moduleName || '').toLowerCase());
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

      if (req.authType === 'api_key' && req.apiKey) {
        const scopes = safeJsonParse(req.apiKey.scopes, []);
        const keyType = req.apiKeyMeta?.keyType || req.user?.keyType || 'sk';

        const normalizedAction =
          action === 'update' ? 'write' :
          action === 'create' ? 'write' :
          action === 'delete' ? 'delete' :
          action === 'read' ? 'read' :
          action;

        if (keyType === 'pk') {
          if (isWriteLikeAction(action) || isSecretOnlyModule(moduleName)) {
            return res.status(403).json({
              success: false,
              message: `Forbidden: public key cannot access ${moduleName}.${action}`,
              requestId: req.requestId || null
            });
          }
        }

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

      const role = req.user.role;

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
