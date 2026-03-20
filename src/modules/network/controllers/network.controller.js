const os = require('os');
const NetworkConfig = require('../models/network-config.model');

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

function getLocalInterfaces() {
  const nets = os.networkInterfaces();
  const out = [];

  Object.keys(nets).forEach((name) => {
    (nets[name] || []).forEach((net) => {
      if (net.family === 'IPv4') {
        out.push({
          interface: name,
          address: net.address,
          internal: !!net.internal,
          netmask: net.netmask,
          mac: net.mac
        });
      }
    });
  });

  return out;
}

function guessRouterIps(localInterfaces) {
  const guesses = [];

  for (const item of localInterfaces) {
    if (item.internal) continue;
    const parts = String(item.address || '').split('.');
    if (parts.length === 4) {
      guesses.push(`${parts[0]}.${parts[1]}.${parts[2]}.1`);
    }
  }

  return [...new Set(guesses)];
}

function buildGuide(config, runtime) {
  const routerIp = config?.routerIp || runtime.routerGuesses?.[0] || '192.168.1.1';
  const localServerIp = config?.localServerIp || runtime.primaryLocalIp || '192.168.1.10';
  const publicPort = Number(config?.publicPort || 3000);
  const appPort = Number(config?.appPort || 3000);
  const protocol = config?.protocol || 'TCP';

  return [
    '1. Login to your router admin page',
    `   Example router URL: http://${routerIp}`,
    '',
    '2. Find Port Forwarding / NAT / Virtual Server settings',
    '',
    '3. Create a new rule using the values below:',
    `   Protocol: ${protocol}`,
    `   External/Public Port: ${publicPort}`,
    `   Internal/Local IP: ${localServerIp}`,
    `   Internal/App Port: ${appPort}`,
    '',
    '4. Save the router rule and restart router if needed',
    '',
    '5. Keep this server/PC online 24/7',
    '',
    '6. Test public access using your DDNS/public gateway',
    `   Example: ${runtime.globalExample || 'http://your-public-gateway'}`,
    '',
    '7. For cleaner production access, enable reverse proxy + SSL later'
  ].join('\n');
}

exports.getConfig = async (req, res) => {
  try {
    let config = await NetworkConfig.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (!config) {
      config = await NetworkConfig.create({
        appPort: Number(process.env.PORT || 3000),
        publicPort: Number(process.env.PORT || 3000),
        protocol: 'TCP',
        providerMode: 'self_hosted'
      });
    }

    const localInterfaces = getLocalInterfaces();
    const primaryLocalIp = (localInterfaces.find(x => !x.internal) || {}).address || null;
    const routerGuesses = guessRouterIps(localInterfaces);
    const publicIp = await detectPublicIp();

    const runtime = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptimeSeconds: os.uptime(),
      localInterfaces,
      primaryLocalIp,
      routerGuesses,
      publicIp,
      globalExample: config.ddnsDomain
        ? `${config.sslEnabled ? 'https' : 'http'}://${config.ddnsDomain}${[80,443].includes(Number(config.publicPort || 3000)) ? '' : ':' + Number(config.publicPort || 3000)}`
        : publicIp
          ? `${config.sslEnabled ? 'https' : 'http'}://${publicIp}:${Number(config.publicPort || 3000)}`
          : null
    };

    return res.json({
      success: true,
      config,
      runtime,
      guide: buildGuide(config, runtime)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load network config',
      error: error.message
    });
  }
};

exports.saveConfig = async (req, res) => {
  try {
    let config = await NetworkConfig.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (!config) {
      config = await NetworkConfig.create({});
    }

    const fields = [
      'routerIp',
      'localServerIp',
      'appPort',
      'publicPort',
      'protocol',
      'domainGateway',
      'ddnsDomain',
      'sslEnabled',
      'reverseProxyEnabled',
      'providerMode',
      'notes'
    ];

    fields.forEach((field) => {
      if (req.body?.[field] !== undefined) {
        config[field] = req.body[field];
      }
    });

    await config.save();

    return res.json({
      success: true,
      message: 'Network config saved',
      config
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save network config',
      error: error.message
    });
  }
};

exports.checklist = async (req, res) => {
  try {
    const config = await NetworkConfig.findOne({
      order: [['createdAt', 'DESC']]
    });

    const localInterfaces = getLocalInterfaces();
    const publicIp = await detectPublicIp();

    const checks = {
      hasLocalServerIp: !!(config?.localServerIp || localInterfaces.find(x => !x.internal)),
      hasRouterIp: !!config?.routerIp,
      hasPublicIp: !!publicIp,
      hasGateway: !!(config?.ddnsDomain || config?.domainGateway || publicIp),
      appPortConfigured: !!config?.appPort,
      publicPortConfigured: !!config?.publicPort,
      reverseProxyConfigured: !!config?.reverseProxyEnabled,
      sslConfigured: !!config?.sslEnabled
    };

    const readinessPercent = Math.round(
      (Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100
    );

    return res.json({
      success: true,
      checks,
      readinessPercent,
      publicIp,
      localInterfaces
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to build network checklist',
      error: error.message
    });
  }
};
