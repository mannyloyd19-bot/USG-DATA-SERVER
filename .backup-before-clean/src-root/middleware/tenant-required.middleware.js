const TenantMembership = require('../modules/tenantMemberships/models/tenant-membership.model');

module.exports = function tenantRequired(options = {}) {
  const requireMembership = options.requireMembership !== false;
  const allowApiKeys = options.allowApiKeys !== false;

  return async function (req, res, next) {
    try {
      const tenantId = req.tenantContext?.tenantId;
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (req.user.role === 'super_admin') {
        return next();
      }

      if (req.authType === 'api_key') {
        if (!allowApiKeys) {
          return res.status(403).json({
            success: false,
            message: 'API key access is not allowed for this tenant route'
          });
        }

        if (req.apiKey?.tenantId && req.apiKey.tenantId !== tenantId) {
          return res.status(403).json({
            success: false,
            message: 'API key tenant mismatch'
          });
        }

        return next();
      }

      if (!requireMembership) {
        return next();
      }

      if (!req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'User has no tenant membership binding'
        });
      }

      const membership = await TenantMembership.findOne({
        where: {
          tenantId,
          userId: req.user.id,
          status: 'active'
        }
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'User is not an active member of this tenant'
        });
      }

      req.tenantMembership = membership;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Tenant enforcement failed',
        error: error.message
      });
    }
  };
};
