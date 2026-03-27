const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const { UPLOAD_DIR } = require('../core/utils/paths');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function sanitizeFilename(name) {
  return String(name || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '');
    const base = path.basename(file.originalname || 'file', ext);
    const safe = sanitizeFilename(base);
    cb(null, `${Date.now()}-${randomUUID()}-${safe}${ext}`);
  }
});

module.exports = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});
