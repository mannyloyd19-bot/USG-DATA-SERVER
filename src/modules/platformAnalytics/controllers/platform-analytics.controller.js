const os = require('os');
const Domain = require('../../domains/models/domain.model');
const BackupJob = require('../../backupSystem/models/backup-job.model');
const ApiKey = require('../../apiKeys/models/api-key.model');
const Tenant = require('../../tenants/models/tenant.model');

exports.summary = async (req, res) => {
  try {
    const [domains, backups, apiKeys, tenants] = await Promise.all([
      Domain.count().catch(() => 0),
      BackupJob.count().catch(() => 0),
      ApiKey.count().catch(() => 0),
      Tenant.count().catch(() => 0)
    ]);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return res.json({
      success: true,
      summary: {
        domains,
        backups,
        apiKeys,
        tenants,
        uptimeSeconds: os.uptime(),
        memoryUsagePercent: Number(((usedMem / totalMem) * 100).toFixed(2)),
        cpuCores: os.cpus().length,
        platform: os.platform()
      },
      charts: {
        requests: [12, 18, 17, 26, 31, 28, 36],
        errors: [1, 0, 2, 1, 1, 0, 1],
        backups: [0, 1, 0, 1, 1, 0, 1]
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
