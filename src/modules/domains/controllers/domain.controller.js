const crypto = require('crypto');
const Domain = require('../models/domain.model');

function normalizeName(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeRoute(value = '') {
  let v = String(value || '').trim();
  if (!v) v = '/';
  if (!v.startsWith('/')) v = '/' + v;
  return v;
}

function buildGateway() {
  const d = process.env.DUCKDNS_DOMAIN;
  if (d) {
    return d.includes('.duckdns.org') ? d : `${d}.duckdns.org`;
  }
  return 'usgdataserver.duckdns.org';
}

function buildPublicAddress(routePath, accessMode) {
  if (accessMode !== 'public') return 'Internal Only';
  return `https://${buildGateway()}${routePath}`;
}

function buildSubdomainPreview(domainName) {
  const gateway = buildGateway();
  const sub = domainName.replace(/\.usg$/i, '');
  return `https://${sub}.${gateway}`;
}

function createDomainKey(name) {
  const clean = name.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 12);
  const rand = crypto.randomBytes(3).toString('hex');
  return `dom_${clean}_${rand}`;
}

async function routeConflictExists(routePath, excludeId = null) {
  const where = { routePath };
  const rows = await Domain.findAll({ where });
  return rows.some((r) => r.id !== excludeId && r.status === 'active');
}

exports.list = async (req, res) => {
  try {
    const rows = await Domain.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ success: true, domains: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      name,
      serviceName,
      routePath,
      accessMode,
      environment,
      notes
    } = req.body || {};

    const finalName = normalizeName(name);
    const finalRoute = normalizeRoute(routePath);

    if (!finalName || !finalRoute || !serviceName) {
      return res.status(400).json({
        success: false,
        message: 'Domain Name, Service Name, and Route Path are required'
      });
    }

    if (!finalName.endsWith('.usg')) {
      return res.status(400).json({
        success: false,
        message: 'Domain Name must end with .usg'
      });
    }

    const existing = await Domain.findOne({ where: { name: finalName } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Domain already exists'
      });
    }

    if (await routeConflictExists(finalRoute)) {
      return res.status(400).json({
        success: false,
        message: 'Route Path is already used by another active domain'
      });
    }

    const item = await Domain.create({
      id: crypto.randomUUID(),
      name: finalName,
      serviceName: String(serviceName).trim(),
      routePath: finalRoute,
      accessMode: accessMode || 'internal',
      environment: environment || 'production',
      domainKey: createDomainKey(finalName),
      publicAddress: buildPublicAddress(finalRoute, accessMode || 'internal'),
      routingMode: 'path',
      status: 'active',
      sslStatus: (accessMode || 'internal') === 'public' ? 'pending' : 'not_required',
      notes: notes || null
    });

    return res.json({ success: true, domain: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Domain not found' });
    }

    const payload = req.body || {};

    const nextName = payload.name !== undefined ? normalizeName(payload.name) : item.name;
    const nextRoute = payload.routePath !== undefined ? normalizeRoute(payload.routePath) : item.routePath;
    const nextAccess = payload.accessMode !== undefined ? payload.accessMode : item.accessMode;

    if (!nextName.endsWith('.usg')) {
      return res.status(400).json({ success: false, message: 'Domain Name must end with .usg' });
    }

    if (await routeConflictExists(nextRoute, item.id)) {
      return res.status(400).json({
        success: false,
        message: 'Route Path is already used by another active domain'
      });
    }

    item.name = nextName;
    if (payload.serviceName !== undefined) item.serviceName = String(payload.serviceName).trim();
    item.routePath = nextRoute;
    item.accessMode = nextAccess;
    if (payload.environment !== undefined) item.environment = payload.environment;
    if (payload.status !== undefined) item.status = payload.status;
    if (payload.notes !== undefined) item.notes = payload.notes || null;
    item.publicAddress = buildPublicAddress(item.routePath, item.accessMode);
    item.sslStatus = item.accessMode === 'public' ? item.sslStatus || 'pending' : 'not_required';

    await item.save();
    return res.json({ success: true, domain: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Domain.destroy({ where: { id: req.params.id } });
    return res.json({ success: true });
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
      details: {
        internalDomain: item.name,
        boundService: item.serviceName,
        targetRoute: item.routePath,
        publicWebsiteAddress: item.publicAddress,
        domainKey: item.domainKey,
        routingMode: item.routingMode,
        gateway: buildGateway(),
        sslStatus: item.sslStatus,
        status: item.status,
        environment: item.environment,
        subdomainReadyPreview: buildSubdomainPreview(item.name),
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
