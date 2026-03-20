const Domain = require('../../modules/domains/models/domain.model');

async function domainRouter(req, res, next) {
  try {
    let host = req.headers.host;

    if (!host) return next();

    // remove port
    host = host.split(':')[0];

    // handle subdomain (audit.usgdataserver.duckdns.org)
    const parts = host.split('.');
    
    let subdomain = null;

    if (parts.length >= 3) {
      subdomain = parts[0]; // audit
    }

    // handle internal .usg (dev/local)
    if (host.endsWith('.usg')) {
      subdomain = host.replace('.usg', '');
    }

    if (!subdomain) return next();

    const domainName = subdomain + '.usg';

    const domain = await Domain.findOne({
      where: { name: domainName, isActive: true }
    });

    if (!domain) return next();

    // rewrite URL
    req.url = domain.target + req.url;

    console.log(`🌐 Domain routed: ${domain.name} → ${domain.target}`);

    next();
  } catch (err) {
    console.error('Domain routing error:', err);
    next();
  }
}

module.exports = domainRouter;
