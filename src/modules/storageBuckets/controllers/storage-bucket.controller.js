const StorageBucket = require('../models/storage-bucket.model');
const File = require('../../files/models/file.model');
const { generateSignedUrl, verifySignedUrl } = require('../services/signed-url.service');

function normalize(value = '') {
  return String(value || '').trim();
}

function normalizeSlug(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

exports.listBuckets = async (req, res) => {
  try {
    const rows = await StorageBucket.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ success: true, buckets: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBucket = async (req, res) => {
  try {
    const name = normalize(req.body?.name);
    const slug = normalizeSlug(req.body?.slug || name);
    const visibility = normalize(req.body?.visibility || 'private').toLowerCase();
    const description = normalize(req.body?.description || '');

    if (!name) {
      return res.status(400).json({ success: false, message: 'Bucket name is required' });
    }

    const row = await StorageBucket.create({
      name,
      slug,
      visibility: visibility === 'public' ? 'public' : 'private',
      description: description || null
    });

    return res.json({ success: true, bucket: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listFilesByBucket = async (req, res) => {
  try {
    const bucket = await StorageBucket.findByPk(req.params.id);
    if (!bucket) {
      return res.status(404).json({ success: false, message: 'Bucket not found' });
    }

    const rows = await File.findAll({
      where: { bucketId: bucket.id },
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      bucket,
      files: rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateFileSignedUrl = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const signed = generateSignedUrl({
      fileId: file.id,
      expiresInSeconds: Number(req.body?.expiresInSeconds || 900)
    });

    return res.json({
      success: true,
      signedUrl: `/api/storage-buckets/files/${file.id}/access?${signed.query}`,
      expires: signed.expires
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.accessFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const bucketId = file.bucketId || null;
    let bucket = null;
    if (bucketId) {
      bucket = await StorageBucket.findByPk(bucketId);
    }

    const isPublic = bucket?.visibility === 'public' || file.visibility === 'public';

    if (!isPublic) {
      const ok = verifySignedUrl({
        fileId: file.id,
        expires: req.query.expires,
        sig: req.query.sig
      });

      if (!ok) {
        return res.status(403).json({ success: false, message: 'Invalid or expired signed URL' });
      }
    }

    return res.json({
      success: true,
      file: {
        id: file.id,
        name: file.name || file.filename || 'file',
        url: file.url || null,
        path: file.path || null,
        bucketId: file.bucketId || null,
        visibility: file.visibility || bucket?.visibility || 'private'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
