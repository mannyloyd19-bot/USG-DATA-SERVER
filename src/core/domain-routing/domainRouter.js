const Domain = require('../../modules/domains/models/domain.model');

function stripPort(host = '') {
  return String(host || '').split(':')[0].trim().toLowerCase();
}

function getForwardedHost(req) {
  return stripPort(
    req.headers['x-forwarded-host'] ||
    req.headers['host'] ||
    ''
  );
}

function inferInternalDomainFromHost(host) {
  if (!host) return null;

  if (host.endsWith('.usg')) {
    return host;
  }

  const parts = host.split('.');
  if (parts.length >= 3) {
    return `${parts[0]}.usg`;
  }

  return null;
}

async function domainRouter(req, res, next) {
  try {
    const host = getForwardedHost(req);
    const internalCandidate = inferInternalDomainFromHost(host);

    if (!internalCandidate) {
      return next();
    }

    const domain = await Domain.findOne({
      where: {
        name: internalCandidate,
        isActive: true
      }
    });

    if (!domain) {
      return next();
    }

    const originalUrl = req.url || '/';
    const mappedBase = String(domain.target || '/').replace(/\/+$/, '') || '/';
    const normalizedOriginal = originalUrl === '/' ? '' : originalUrl;
    const rewritten = mappedBase === '/' ? normalizedOriginal || '/' : `${mappedBase}${normalizedOriginal}`;

    req.headers['x-usg-domain-name'] = domain.name;
    req.headers['x-usg-domain-target'] = domain.target;
    req.url = rewritten;

    console.log(`Domain routed: ${host} -> ${domain.name} -> ${rewritten}`);
    return next();
  } catch (err) {
    console.error('Domain routing error:', err.message);
    return next();
  }
}

module.exports = domainRouter;
