const path = require('path');

function resolveAppPath(inputPath, fallback) {
  const raw = String(inputPath || fallback || '').trim();
  return path.resolve(process.cwd(), raw);
}

const DB_STORAGE = resolveAppPath(process.env.DB_STORAGE, 'storage/database.sqlite');
const UPLOAD_DIR = resolveAppPath(process.env.UPLOAD_DIR, 'storage/uploads');
const BACKUP_DIR = resolveAppPath(process.env.BACKUP_DIR, 'storage/backups');

module.exports = {
  DB_STORAGE,
  UPLOAD_DIR,
  BACKUP_DIR
};
