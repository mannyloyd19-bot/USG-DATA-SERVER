const fs = require('fs');
const cron = require('node-cron');
const backupService = require('./backup.service');
const { BACKUP_DIR } = require('../../../core/utils/paths');

function cleanupOldBackups(keepCount) {
  if (!fs.existsSync(BACKUP_DIR)) return;

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(name => name.endsWith('.sqlite'))
    .map(name => {
      const full = require('path').join(BACKUP_DIR, name);
      const stats = fs.statSync(full);
      return { name, full, createdAt: stats.birthtimeMs };
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const keep = Math.max(Number(keepCount || 20), 1);
  const remove = files.slice(keep);

  for (const item of remove) {
    try {
      fs.unlinkSync(item.full);
      console.log('Removed old backup:', item.name);
    } catch (error) {
      console.error('Failed to remove old backup:', item.name, error.message);
    }
  }
}

async function runBackupJob() {
  try {
    const result = await backupService.createBackup();
    console.log('Auto backup created:', result.filename);
    cleanupOldBackups(process.env.AUTO_BACKUP_KEEP || 20);
  } catch (error) {
    console.error('Auto backup failed:', error.message);
  }
}

exports.startAutoBackup = () => {
  const enabled = String(process.env.AUTO_BACKUP_ENABLED || 'true').toLowerCase() === 'true';
  const schedule = process.env.AUTO_BACKUP_CRON || '0 */2 * * *';

  if (!enabled) {
    console.log('Auto backup disabled.');
    return;
  }

  if (!cron.validate(schedule)) {
    console.error('Invalid AUTO_BACKUP_CRON:', schedule);
    return;
  }

  cron.schedule(schedule, runBackupJob);
  console.log('Auto backup scheduler started:', schedule);
};
