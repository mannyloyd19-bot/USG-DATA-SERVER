const fs = require('fs');
const path = require('path');
const { DB_STORAGE, BACKUP_DIR } = require('../../../core/utils/paths');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

exports.createBackup = async () => {
  ensureDir(BACKUP_DIR);

  if (!fs.existsSync(DB_STORAGE)) {
    throw new Error('Database file not found');
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${stamp}.sqlite`;
  const target = path.join(BACKUP_DIR, filename);

  fs.copyFileSync(DB_STORAGE, target);

  const stats = fs.statSync(target);

  return {
    filename,
    path: target,
    size: stats.size,
    createdAt: stats.birthtime
  };
};

exports.listBackups = async () => {
  ensureDir(BACKUP_DIR);

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(name => name.endsWith('.sqlite'))
    .map(name => {
      const full = path.join(BACKUP_DIR, name);
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
