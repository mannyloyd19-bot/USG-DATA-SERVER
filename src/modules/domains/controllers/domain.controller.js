const Domain = require('../models/domain.model');

function normalizeRoute(value = '') {
  const v = String(value || '').trim();
  if (!v) return '/';
  return v.startsWith('/') ? v : `/${v}`;
}

function buildPublicUrl(route, type) {
  if (type !== 'public') return 'Internal Only';
  const base = process.env.DUCKDNS_DOMAIN
    ? `https://${process.env.DUCKDNS_DOMAIN}.duckdns.org`
    : 'https://usgdataserver.duckdns.org';
  return `${base}${route}`;
}

function createDomainKey(name = '') {
  const clean = String(name || '').replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 8);
  return `dom_${clean}_${rand}`;
}

exports.getAll = async (req, res) => {
  try {
    const rows = await Domain.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      domains: rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, route, type, notes } = req.body || {};

    if (!name || !route) {
      return res.status(400).json({
        success: false,
        message: 'Domain name and app route are required'
      });
    }

    const exists = await Domain.findOne({
      where: { name: String(name).trim().toLowerCase() }
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Domain already exists'
      });
    }

    const normalizedName = String(name).trim().toLowerCase();
    const normalizedRoute = normalizeRoute(route);
    const finalType = type || 'internal';

    const item = await Domain.create({
      name: normalizedName,
      route: normalizedRoute,
      type: finalType,
      domainKey: createDomainKey(normalizedName),
      publicUrl: buildPublicUrl(normalizedRoute, finalType),
      status: 'active',
      notes: notes || null
    });

    return res.json({
      success: true,
      domain: item
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    const payload = req.body || {};

    if (payload.name !== undefined) item.name = String(payload.name).trim().toLowerCase();
    if (payload.route !== undefined) item.route = normalizeRoute(payload.route);
    if (payload.type !== undefined) item.type = payload.type;
    if (payload.notes !== undefined) item.notes = payload.notes || null;
    if (payload.status !== undefined) item.status = payload.status;

    item.publicUrl = buildPublicUrl(item.route, item.type);

    await item.save();

    return res.json({
      success: true,
      domain: item
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    await Domain.destroy({
      where: { id: req.params.id }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.preview = async (req, res) => {
  try {
    const item = await Domain.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    return res.json({
      success: true,
      preview: {
        internalDomain: item.name,
        appRoute: item.route,
        publicWebsiteAddress: item.publicUrl,
        domainKey: item.domainKey,
        status: item.status,
        subdomainReadyExample: process.env.DUCKDNS_DOMAIN
          ? `https://${item.name.replace('.usg', '')}.${process.env.DUCKDNS_DOMAIN}.duckdns.org`
          : `https://${item.name.replace('.usg', '')}.usgdataserver.duckdns.org`
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
