const Domain = require('../modules/domains/models/domain.model');
const DomainBinding = require('../modules/domains/models/domainBinding.model');

module.exports = async function domainAuth(req, res, next) {
  try {
    const domainKey = req.headers['x-domain-key'];
    const appToken = req.headers['x-app-token'];

    if (!domainKey || !appToken) {
      return res.status(401).json({
        success: false,
        message: 'Missing domain credentials'
      });
    }

    const domain = await Domain.findOne({
      where: { domainKey, status: 'active' }
    });

    if (!domain) {
      return res.status(403).json({
        success: false,
        message: 'Invalid domain key'
      });
    }

    const binding = await DomainBinding.findOne({
      where: {
        domainId: domain.id,
        appToken,
        bindStatus: 'active'
      }
    });

    if (!binding) {
      return res.status(403).json({
        success: false,
        message: 'Invalid app token'
      });
    }

    // attach context
    req.usg = {
      domainId: domain.id,
      domainName: domain.name,
      service: domain.serviceName
    };

    next();
  } catch (error) {
    console.error('[domainAuth] error:', error);
    return res.status(500).json({
      success: false,
      message: 'Auth system error'
    });
  }
};
