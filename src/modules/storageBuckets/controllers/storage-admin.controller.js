const StorageBucket = require('../models/storage-bucket.model');
const File = require('../../files/models/file.model');
const crypto = require('crypto');

function generateSignedToken(fileId) {
  const rand = crypto.randomBytes(8).toString('hex');
  return `signed_${fileId}_${rand}`;
}

exports.listBuckets = async (req, res) => {
  try {
    const rows = await StorageBucket.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, buckets: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listFilesByBucket = async (req, res) => {
  try {
    const rows = await File.findAll({
      where: { bucketId: req.params.id },
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, files: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateSignedUrl = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const token = generateSignedToken(file.id);

    file.signedToken = token;
    file.signedExpiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 min
    await file.save();

    return res.json({
      success: true,
      url: `/api/storage-admin/access/${file.id}?token=${token}`,
      expiresAt: file.signedExpiresAt
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.accessFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).send('File not found');
    }

    if (
      file.signedToken !== req.query.token ||
      !file.signedExpiresAt ||
      new Date(file.signedExpiresAt).getTime() < Date.now()
    ) {
      return res.status(403).send('Invalid or expired signed URL');
    }

    return res.redirect(file.path || file.url || '#');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
