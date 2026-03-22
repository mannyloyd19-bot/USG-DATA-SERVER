module.exports = function tenantIsolation(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || req.query.tenantId || null;

  if (tenantId) {
    req.tenant = { id: String(tenantId) };
  }

  next();
};
