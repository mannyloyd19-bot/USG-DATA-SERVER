const crypto = require('crypto');
const Domain = require('../../domains/models/domain.model');

function buildGateway() {
  const d = process.env.DUCKDNS_DOMAIN;
  if (d) {
    return d.includes('.duckdns.org') ? d : `${d}.duckdns.org`;
  }
  return 'usgdataserver.duckdns.org';
}

function createAppToken(name) {
  const clean = String(name || '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .slice(0, 12);
  const rand = crypto.randomBytes(4).toString('hex');
  return `appreg_${clean}_${rand}`;
}

exports.ensureBinding = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    let changed = false;

    if (!item.domainKey) {
      const clean = String(item.name || '')
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase()
        .slice(0, 12);
      item.domainKey = `dom_${clean}_${crypto.randomBytes(3).toString('hex')}`;
      changed = true;
    }

    if (!item.appToken) {
      item.appToken = createAppToken(item.name);
      changed = true;
    }

    if (!item.bindStatus) {
      item.bindStatus = 'bound';
      changed = true;
    }

    if (changed) {
      await item.save();
    }

    const gateway = buildGateway();

    return res.json({
      success: true,
      binding: {
        domainId: item.id,
        domain: item.name,
        routePath: item.routePath,
        serviceName: item.serviceName,
        domainKey: item.domainKey,
        appToken: item.appToken,
        bindStatus: item.bindStatus,
        publicAddress: item.publicAddress,
        apiBaseUrl: `https://${gateway}`,
        config: {
          APP_NAME: item.serviceName || '',
          APP_DOMAIN: item.name || '',
          APP_ROUTE: item.routePath || '/',
          USG_DOMAIN_KEY: item.domainKey || '',
          USG_API_BASE_URL: `https://${gateway}`,
          USG_APP_TOKEN: item.appToken || ''
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBinding = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    const gateway = buildGateway();

    return res.json({
      success: true,
      binding: {
        domainId: item.id,
        domain: item.name,
        routePath: item.routePath,
        serviceName: item.serviceName,
        domainKey: item.domainKey || '',
        appToken: item.appToken || '',
        bindStatus: item.bindStatus || 'unbound',
        publicAddress: item.publicAddress,
        apiBaseUrl: `https://${gateway}`,
        config: {
          APP_NAME: item.serviceName || '',
          APP_DOMAIN: item.name || '',
          APP_ROUTE: item.routePath || '/',
          USG_DOMAIN_KEY: item.domainKey || '',
          USG_API_BASE_URL: `https://${gateway}`,
          USG_APP_TOKEN: item.appToken || ''
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
