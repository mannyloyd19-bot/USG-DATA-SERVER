const fs = require('fs');
const path = require('path');
const notificationTrigger = require('../../notifications/services/notification-trigger.service');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

exports.createBackup = async () => {
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  const backupsDir = path.join(process.cwd(), 'backups');
  ensureDir(backupsDir);

  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file not found');
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${stamp}.sqlite`;
  const target = path.join(backupsDir, filename);

  fs.copyFileSync(dbPath, target);

  const stats = fs.statSync(target);

  return {
    filename,
    path: target,
    size: stats.size,
    createdAt: stats.birthtime
  };
};

exports.listBackups = async () => {
  const backupsDir = path.join(process.cwd(), 'backups');
  ensureDir(backupsDir);

  const files = fs.readdirSync(backupsDir)
    .filter(name => name.endsWith('.sqlite'))
    .map(name => {
      const full = path.join(backupsDir, name);
      const stats = fs.statSync(full);
      return {
        filename: name,
        path: full,
        size: stats.size,
        createdAt: stats.birthtime
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return files;
};