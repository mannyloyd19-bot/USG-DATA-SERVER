const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '');
    const base = path
      .basename(file.originalname || 'file', ext)
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .slice(0, 60);

    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base || 'file'}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

module.exports = upload;
