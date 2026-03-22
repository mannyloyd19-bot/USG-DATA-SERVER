module.exports = function rowLevelSecurity(req, res, next) {
  const tenantId = req.tenant?.id || req.headers['x-tenant-id'] || req.query.tenantId || null;

  req.rls = {
    tenantId: tenantId ? String(tenantId) : null,
    applyTenantFilter(rows = []) {
      if (!this.tenantId) return rows;
      return rows.filter(row => {
        const direct = row.tenantId ?? row.data?.tenantId ?? null;
        return String(direct || '') === String(this.tenantId);
      });
    },
    applyTenantPayload(payload = {}) {
      if (!this.tenantId) return payload;
      return { ...payload, tenantId: this.tenantId };
    }
  };

  next();
};
