const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const InfrastructureConfig = require('../models/infrastructure-config.model');

async function detectPublicIp() {
  try {
    if (typeof fetch !== 'function') return null;
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return null;
    const data = await res.json();
    return data.ip || null;
  } catch {
    return null;
  }
}

function run(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 15000, maxBuffer: 1024 * 1024 * 4 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout ? stdout.trim() : '',
        stderr: stderr ? stderr.trim() : '',
        error: error ? error.message : null
      });
    });
  });
}

function getLocalIps() {
  const nets = os.networkInterfaces();
  const out = [];
  Object.keys(nets).forEach((name) => {
    (nets[name] || []).forEach((net) => {
      if (net.family === 'IPv4' && !net.internal) {
        out.push({ interface: name, address: net.address });
      }
    });
  });
  return out;
}

function buildGlobalUrl(config, publicIp) {
  const ssl = !!config?.sslEnabled;
  const protocol = ssl ? 'https' : 'http';
  const publicPort = Number(config?.publicPort || config?.appPort || 3000);

  if (config?.domainType === 'custom' && config?.customDomain) {
    return `${protocol}://${config.customDomain}${publicPort === 80 || publicPort === 443 ? '' : ':' + publicPort}`;
  }

  if (config?.domainType === 'ddns' && config?.ddnsDomain) {
    return `${protocol}://${config.ddnsDomain}${publicPort === 80 || publicPort === 443 ? '' : ':' + publicPort}`;
  }

  if (publicIp) {
    return `${protocol}://${publicIp}:${publicPort}`;
  }

  return null;
}

async function getLatestConfig() {
  let config = await InfrastructureConfig.findOne({
    order: [['createdAt', 'DESC']]
  });

  if (!config) {
    config = await InfrastructureConfig.create({
      mode: 'on_prem',
      domainType: 'ddns',
      ddnsProvider: 'duckdns',
      appPort: Number(process.env.PORT || 3000),
      publicPort: Number(process.env.PORT || 3000)
    });
  }

  return config;
}

exports.getConfig = async (req, res) => {
  try {
    const config = await getLatestConfig();
    const publicIp = await detectPublicIp();
    const localIps = getLocalIps();
    const hostname = os.hostname();
    const globalUrl = buildGlobalUrl(config, publicIp);

    return res.json({
      success: true,
      config,
      runtime: {
        hostname,
        platform: os.platform(),
        uptimeSeconds: os.uptime(),
        localIps,
        publicIp,
        appPort: Number(process.env.PORT || config.appPort || 3000),
        globalUrl
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load infrastructure config',
      error: error.message
    });
  }
};

exports.saveConfig = async (req, res) => {
  try {
    const payload = req.body || {};
    const config = await getLatestConfig();

    const fields = [
      'mode',
      'domainType',
      'customDomain',
      'subdomain',
      'ddnsProvider',
      'ddnsDomain',
      'ddnsToken',
      'appPort',
      'publicPort',
      'sslEnabled',
      'reverseProxyEnabled',
      'notes'
    ];

    fields.forEach((field) => {
      if (payload[field] !== undefined) {
        config[field] = payload[field];
      }
    });

    await config.save();

    return res.json({
      success: true,
      message: 'Infrastructure config saved',
      config
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save infrastructure config',
      error: error.message
    });
  }
};

exports.globalStatus = async (req, res) => {
  try {
    const config = await getLatestConfig();
    const publicIp = await detectPublicIp();
    const localIps = getLocalIps();
    const globalUrl = buildGlobalUrl(config, publicIp);

    const checks = {
      hasPublicIp: !!publicIp,
      hasDomainLikeName: !!(config.customDomain || config.ddnsDomain),
      sslReady: !!config.sslEnabled,
      reverseProxyReady: !!config.reverseProxyEnabled,
      appPortReady: !!config.appPort,
      globalUrlReady: !!globalUrl
    };

    const readinessPercent = Math.round(
      (Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100
    );

    return res.json({
      success: true,
      checks,
      readinessPercent,
      runtime: {
        publicIp,
        localIps,
        globalUrl
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to build global status',
      error: error.message
    });
  }
};

exports.sslStatus = async (req, res) => {
  try {
    const config = await getLatestConfig();
    const domain = config.customDomain || config.ddnsDomain || 'usgdataserver.duckdns.org';

    const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;
    const certExists = fs.existsSync(certPath);

    const nginxCheck = await run('nginx -t');
    const certbotCheck = await run('certbot certificates');
    const renewCheck = await run('certbot renew --dry-run');

    return res.json({
      success: true,
      ssl: {
        domain,
        enabledInConfig: !!config.sslEnabled,
        reverseProxyEnabled: !!config.reverseProxyEnabled,
        certificatePath: certPath,
        certificateExists: certExists
      },
      nginx: nginxCheck,
      certbotCertificates: certbotCheck,
      renewDryRun: renewCheck
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to read SSL status',
      error: error.message
    });
  }
};
