module.exports = function tenantContext(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || null;
  const tenantSlug = req.headers['x-tenant-slug'] || null;

  req.tenantContext = {
    tenantId,
    tenantSlug
  };

  next();
};
