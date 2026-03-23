const Domain = require('../../domains/models/domain.model');

function buildStatus(item) {
  const isPublic = item.accessMode === 'public';
  const sslReady = item.sslStatus === 'active';
  const bindHealthy = !!item.routePath && !!item.serviceName;

  return {
    id: item.id,
    name: item.name,
    serviceName: item.serviceName,
    routePath: item.routePath,
    accessMode: item.accessMode,
    environment: item.environment,
    status: item.status,
    sslStatus: item.sslStatus || 'unknown',
    publicAddress: item.publicAddress || null,
    routingMode: item.routingMode || 'path',
    domainKey: item.domainKey || null,
    checks: {
      isPublic,
      sslReady,
      bindHealthy,
      hasRoute: !!item.routePath,
      hasService: !!item.serviceName,
      active: item.status === 'active'
    }
  };
}

exports.summary = async (req, res) => {
  try {
    const rows = await Domain.findAll({ order: [['createdAt', 'DESC']] });

    const summary = {
      total: rows.length,
      active: rows.filter(x => x.status === 'active').length,
      public: rows.filter(x => x.accessMode === 'public').length,
      internal: rows.filter(x => x.accessMode !== 'public').length,
      sslActive: rows.filter(x => x.sslStatus === 'active').length,
      sslPending: rows.filter(x => x.sslStatus === 'pending').length,
      sslMissing: rows.filter(x => !x.sslStatus || x.sslStatus === 'not_required').length
    };

    return res.json({
      success: true,
      summary,
      domains: rows.map(buildStatus)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.details = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    return res.json({
      success: true,
      domain: buildStatus(item)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markSslActive = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    item.sslStatus = 'active';
    await item.save();

    return res.json({ success: true, domain: item, message: 'SSL marked active' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markSslPending = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    item.sslStatus = 'pending';
    await item.save();

    return res.json({ success: true, domain: item, message: 'SSL marked pending' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markInactive = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    item.status = 'inactive';
    await item.save();

    return res.json({ success: true, domain: item, message: 'Domain marked inactive' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
