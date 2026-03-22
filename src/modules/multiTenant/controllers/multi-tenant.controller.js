exports.status = async (req, res) => {
  try {
    return res.json({
      success: true,
      multiTenant: {
        enabled: true,
        tenantId: req.tenant?.id || null,
        isolationMode: 'request-scoped',
        notes: 'Tenant context is resolved from x-tenant-id header, query, or body'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
