const fs = require('fs');
const path = require('path');
const BackupJob = require('../models/backup-job.model');
const BackupConfig = require('../models/backup-config.model');
const { DB_STORAGE, BACKUP_DIR } = require('../../../core/utils/paths');

let timerRef = null;

function getTimestamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

async function getConfig() {
  let cfg = await BackupConfig.findOne({ order: [['createdAt', 'DESC']] });
  if (!cfg) {
    cfg = await BackupConfig.create({
      backupDir: BACKUP_DIR,
      sourceDbPath: DB_STORAGE,
      autoEnabled: false,
      intervalMinutes: 60,
      retentionCount: 10
    });
  }
  return cfg;
}

async function cleanupRetention(cfg) {
  const jobs = await BackupJob.findAll({
    order: [['createdAt', 'DESC']]
  });

  const keep = Number(cfg.retentionCount || 10);
  const extra = jobs.slice(keep);

  for (const item of extra) {
    try {
      if (fs.existsSync(path.resolve(item.filePath))) {
        fs.unlinkSync(path.resolve(item.filePath));
      }
    } catch {}
    try {
      await item.destroy();
    } catch {}
  }
}

async function runBackup(triggerType = 'manual', notes = '') {
  const cfg = await getConfig();

  const backupDir = path.resolve(cfg.backupDir || BACKUP_DIR);
  const sourceDbPath = path.resolve(cfg.sourceDbPath || DB_STORAGE);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (!fs.existsSync(sourceDbPath)) {
    throw new Error(`Source DB not found: ${sourceDbPath}`);
  }

  const fileName = `backup-${getTimestamp()}.sqlite`;
  const targetPath = path.join(backupDir, fileName);

  fs.copyFileSync(sourceDbPath, targetPath);

  const stat = fs.statSync(targetPath);

  const job = await BackupJob.create({
    fileName,
    filePath: targetPath,
    sizeBytes: stat.size,
    status: 'completed',
    triggerType,
    notes: notes || null
  });

  await cleanupRetention(cfg);

  return job;
}

async function enableAuto(intervalMinutes = 60) {
  const cfg = await getConfig();
  cfg.autoEnabled = true;
  cfg.intervalMinutes = Number(intervalMinutes || 60);
  await cfg.save();

  if (timerRef) clearInterval(timerRef);

  timerRef = setInterval(async () => {
    try {
      await runBackup('auto', 'Scheduled backup');
    } catch (error) {
      console.error('Auto backup failed:', error.message);
    }
  }, Number(cfg.intervalMinutes) * 60 * 1000);

  return cfg;
}

async function disableAuto() {
  const cfg = await getConfig();
  cfg.autoEnabled = false;
  await cfg.save();

  if (timerRef) {
    clearInterval(timerRef);
    timerRef = null;
  }

  return cfg;
}

function isAutoRunning() {
  return !!timerRef;
}

module.exports = {
  getConfig,
  runBackup,
  enableAuto,
  disableAuto,
  isAutoRunning
};
