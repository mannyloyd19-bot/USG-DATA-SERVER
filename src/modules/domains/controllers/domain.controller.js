const Domain = require('../models/domain.model');

function normalizeName(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizePath(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function buildPublicPreview(domain) {
  if (domain.externalHost) {
    return `${domain.sslEnabled ? 'https' : 'http'}://${domain.externalHost}${domain.publicPath || ''}`;
  }
  return null;
}

function buildInternalPreview(domain) {
  return `${domain.internalHost || domain.name} -> ${domain.target}`;
}

function buildNginxPreview(domain) {
  const host = domain.externalHost || 'service.example.com';
  const target = domain.target || '/';
  return [
    'server {',
    '    listen 80;',
    `    server_name ${host};`,
    '',
    '    location / {',
    `        proxy_pass http://127.0.0.1:3000${target};`,
    '        proxy_set_header Host $host;',
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    '    }',
    '}'
  ].join('\n');
}

exports.getDomains = async (req, res) => {
  try {
    const domains = await Domain.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      domains: domains.map(item => {
        const json = item.toJSON();
        return {
          ...json,
          internalPreview: buildInternalPreview(json),
          publicPreview: buildPublicPreview(json),
          nginxPreview: buildNginxPreview(json)
        };
      })
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.createDomain = async (req, res) => {
  try {
    const {
      name,
      type,
      targetType,
      target,
      internalHost,
      externalHost,
      publicPath,
      sslEnabled,
      reverseProxyEnabled,
      notes
    } = req.body || {};

    if (!name || !target) {
      return res.status(400).json({
        success: false,
        message: 'name and target are required'
      });
    }

    const finalName = normalizeName(name);
    const exists = await Domain.findOne({ where: { name: finalName } });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'domain already exists'
      });
    }

    const domain = await Domain.create({
      name: finalName,
      type: type || 'internal',
      targetType: targetType || 'route',
      target: normalizePath(target),
      internalHost: normalizeName(internalHost || finalName),
      externalHost: normalizeName(externalHost || ''),
      publicPath: normalizePath(publicPath || '/'),
      sslEnabled: !!sslEnabled,
      reverseProxyEnabled: !!reverseProxyEnabled,
      notes: notes || null,
      isActive: true
    });

    const json = domain.toJSON();
    return res.json({
      success: true,
      domain: {
        ...json,
        internalPreview: buildInternalPreview(json),
        publicPreview: buildPublicPreview(json),
        nginxPreview: buildNginxPreview(json)
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateDomain = async (req, res) => {
  try {
    const domain = await Domain.findByPk(req.params.id);
    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'domain not found'
      });
    }

    const fields = req.body || {};

    if (fields.name !== undefined) domain.name = normalizeName(fields.name);
    if (fields.type !== undefined) domain.type = fields.type || 'internal';
    if (fields.targetType !== undefined) domain.targetType = fields.targetType || 'route';
    if (fields.target !== undefined) domain.target = normalizePath(fields.target);
    if (fields.internalHost !== undefined) domain.internalHost = normalizeName(fields.internalHost || '');
    if (fields.externalHost !== undefined) domain.externalHost = normalizeName(fields.externalHost || '');
    if (fields.publicPath !== undefined) domain.publicPath = normalizePath(fields.publicPath || '/');
    if (fields.sslEnabled !== undefined) domain.sslEnabled = !!fields.sslEnabled;
    if (fields.reverseProxyEnabled !== undefined) domain.reverseProxyEnabled = !!fields.reverseProxyEnabled;
    if (fields.notes !== undefined) domain.notes = fields.notes || null;
    if (fields.isActive !== undefined) domain.isActive = !!fields.isActive;

    await domain.save();

    const json = domain.toJSON();
    return res.json({
      success: true,
      domain: {
        ...json,
        internalPreview: buildInternalPreview(json),
        publicPreview: buildPublicPreview(json),
        nginxPreview: buildNginxPreview(json)
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.deleteDomain = async (req, res) => {
  try {
    await Domain.destroy({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.nginxPreview = async (req, res) => {
  try {
    const domain = await Domain.findByPk(req.params.id);
    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'domain not found'
      });
    }

    return res.json({
      success: true,
      preview: buildNginxPreview(domain.toJSON())
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
