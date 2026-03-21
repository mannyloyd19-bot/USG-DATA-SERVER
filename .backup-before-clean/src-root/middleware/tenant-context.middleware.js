const Tenant = require('../modules/tenants/models/tenant.model');

module.exports = async function tenantContext(req, res, next) {
  try {
    const tenantId = req.headers['x-tenant-id'] || null;
    const tenantSlug = req.headers['x-tenant-slug'] || null;

    req.tenantContext = {
      tenantId,
      tenantSlug,
      tenant: null
    };

    if (!tenantId && !tenantSlug) {
      return next();
    }

    const where = tenantId ? { id: tenantId } : { slug: tenantSlug };
    const tenant = await Tenant.findOne({ where });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not active'
      });
    }

    req.tenantContext = {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenant
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tenant context failed',
      error: error.message
    });
  }
};
