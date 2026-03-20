const InfrastructureConfig = require('../../infrastructure/models/infrastructure-config.model');
const ddnsService = require('../services/ddns.service');

let intervalRef = null;
let lastRun = null;
let lastResult = null;

async function getLatestConfig() {
  return InfrastructureConfig.findOne({
    order: [['createdAt', 'DESC']]
  });
}

exports.status = async (req, res) => {
  try {
    const config = await getLatestConfig();
    return res.json({
      success: true,
      enabled: !!intervalRef,
      lastRun,
      lastResult,
      config: config || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get DDNS status',
      error: error.message
    });
  }
};

exports.runUpdate = async (req, res) => {
  try {
    const config = await getLatestConfig();

    if (!config || !config.ddnsDomain || !config.ddnsToken) {
      return res.status(400).json({
        success: false,
        message: 'DDNS domain/token not configured'
      });
    }

    const ip = await ddnsService.getPublicIp();
    const result = await ddnsService.updateDuckDNS(
      config.ddnsDomain.replace('.duckdns.org', ''),
      config.ddnsToken,
      ip
    );

    lastRun = new Date().toISOString();
    lastResult = {
      ip,
      ...result
    };

    return res.json({
      success: true,
      ip,
      result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'DuckDNS update failed',
      error: error.message
    });
  }
};

exports.enableAuto = async (req, res) => {
  try {
    const everyMs = Number(req.body?.everyMs || 300000);

    if (intervalRef) {
      clearInterval(intervalRef);
      intervalRef = null;
    }

    intervalRef = setInterval(async () => {
      try {
        const config = await getLatestConfig();
        if (!config || !config.ddnsDomain || !config.ddnsToken) return;

        const ip = await ddnsService.getPublicIp();
        const result = await ddnsService.updateDuckDNS(
          config.ddnsDomain.replace('.duckdns.org', ''),
          config.ddnsToken,
          ip
        );

        lastRun = new Date().toISOString();
        lastResult = {
          ip,
          ...result
        };
      } catch (error) {
        lastRun = new Date().toISOString();
        lastResult = {
          success: false,
          error: error.message
        };
      }
    }, everyMs);

    return res.json({
      success: true,
      message: 'DDNS auto-update enabled',
      everyMs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to enable DDNS auto-update',
      error: error.message
    });
  }
};

exports.disableAuto = async (req, res) => {
  try {
    if (intervalRef) {
      clearInterval(intervalRef);
      intervalRef = null;
    }

    return res.json({
      success: true,
      message: 'DDNS auto-update disabled'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to disable DDNS auto-update',
      error: error.message
    });
  }
};
