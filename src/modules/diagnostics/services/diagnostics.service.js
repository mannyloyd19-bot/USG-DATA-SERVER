const os = require('os');
const { getLogs } = require('./log-buffer.service');
const sequelize = require('../../../core/database');

function bytesToMb(value = 0) {
  return Math.round((Number(value || 0) / 1024 / 1024) * 100) / 100;
}

async function getDiagnostics() {
  const mem = process.memoryUsage();
  let db = { status: 'offline' };

  try {
    await sequelize.authenticate();
    db = { status: 'online' };
  } catch (error) {
    db = { status: 'offline', message: error.message };
  }

  return {
    process: {
      pid: process.pid,
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      cwd: process.cwd(),
      platform: process.platform,
      arch: process.arch
    },
    memory: {
      rssMb: bytesToMb(mem.rss),
      heapTotalMb: bytesToMb(mem.heapTotal),
      heapUsedMb: bytesToMb(mem.heapUsed),
      externalMb: bytesToMb(mem.external)
    },
    system: {
      hostname: os.hostname(),
      cpuCount: os.cpus()?.length || 0,
      loadAverage: os.loadavg(),
      totalMemMb: bytesToMb(os.totalmem()),
      freeMemMb: bytesToMb(os.freemem())
    },
    database: db,
    logs: getLogs().slice(0, 100)
  };
}

module.exports = {
  getDiagnostics
};
