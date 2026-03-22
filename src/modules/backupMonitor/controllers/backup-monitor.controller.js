const BackupJob = require('../../backupSystem/models/backup-job.model');
const BackupConfig = require('../../backupSystem/models/backup-config.model');

async function safeCount(where = {}) {
  try {
    return await BackupJob.count({ where });
  } catch {
    return 0;
  }
}

exports.summary = async (req, res) => {
  try {
    const [total, success, failed, running] = await Promise.all([
      safeCount(),
      safeCount({ status: 'success' }),
      safeCount({ status: 'failed' }),
      safeCount({ status: 'running' })
    ]);

    const latest = await BackupJob.findOne({
      order: [['createdAt', 'DESC']]
    });

    const config = await BackupConfig.findOne({
      order: [['updatedAt', 'DESC']]
    });

    return res.json({
      success: true,
      summary: { total, success, failed, running },
      latest,
      config
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const rows = await BackupJob.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    return res.json({ success: true, backups: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.runNow = async (req, res) => {
  try {
    const item = await BackupJob.create({
      status: 'pending',
      triggerMode: 'manual',
      notes: 'Manual backup requested from monitor'
    });

    return res.json({ success: true, backup: item, message: 'Backup job queued' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
