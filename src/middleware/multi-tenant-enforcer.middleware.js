module.exports = function multiTenantEnforcer(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || req.query.tenantId || req.body?.tenantId || null;

  if (tenantId) {
    req.tenant = { id: String(tenantId) };
  }

  next();
};
