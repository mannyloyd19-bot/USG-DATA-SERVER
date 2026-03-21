const Tenant = require('../../tenants/models/tenant.model');

exports.summary = async (req, res) => {
  try {
    const rows = await Tenant.findAll({ order: [['createdAt', 'DESC']] }).catch(() => []);
    const tenants = rows.map(row => {
      const j = row.toJSON ? row.toJSON() : row;
      return {
        id: j.id,
        name: j.name || j.slug || 'Unnamed Tenant',
        status: j.status || 'active',
        storageUsedMb: 0,
        apiCalls: 0,
        members: 0
      };
    });

    return res.json({
      success: true,
      tenants
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
