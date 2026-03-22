const os = require('os');
const sequelize = require('../../../src/core/database');

async function getDbHealth() {
  try {
    await sequelize.authenticate();
    return { status: 'online' };
  } catch (error) {
    return { status: 'offline', message: error.message };
  }
}

function bytesToMb(value = 0) {
  return Math.round((Number(value || 0) / 1024 / 1024) * 100) / 100;
}

async function buildRuntimeSummary() {
  const mem = process.memoryUsage();
  const load = os.loadavg();

  return {
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    cpuCount: os.cpus()?.length || 0,
    loadAverage: load,
    memory: {
      rssMb: bytesToMb(mem.rss),
      heapTotalMb: bytesToMb(mem.heapTotal),
      heapUsedMb: bytesToMb(mem.heapUsed),
      externalMb: bytesToMb(mem.external)
    },
    system: {
      totalMemMb: bytesToMb(os.totalmem()),
      freeMemMb: bytesToMb(os.freemem())
    }
  };
}

module.exports = {
  getDbHealth,
  buildRuntimeSummary
};
