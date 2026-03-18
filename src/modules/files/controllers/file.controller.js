const fs = require('fs');
const path = require('path');
const FileEntry = require('../models/file.model');
const auditService = require('../../audit/services/audit.service');

function isPreviewable(mimeType = '') {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/')
  );
}

exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const entry = await FileEntry.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storagePath: req.file.path,
      collectionKey: req.body.collectionKey || null,
      recordId: req.body.recordId || null,
      uploadedBy: req.user ? req.user.id : null,
      metadata: {
        destination: req.file.destination,
        previewable: isPreviewable(req.file.mimetype)
      }
    });

    await auditService.writeLog({
      req,
      user: req.user,
      module: 'files',
      action: 'upload',
      entityType: 'FileEntry',
      entityId: entry.id,
      collectionKey: entry.collectionKey,
      status: 'success',
      message: 'File uploaded successfully',
      afterData: entry.toJSON()
    });

    return res.status(201).json(entry);
  } catch (error) {
    await auditService.writeLog({
      req,
      user: req.user,
      module: 'files',
      action: 'upload',
      entityType: 'FileEntry',
      status: 'failed',
      message: error.message
    });

    return res.status(500).json({
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.collectionKey) where.collectionKey = req.query.collectionKey;
    if (req.query.recordId) where.recordId = req.query.recordId;
    if (req.query.uploadedBy) where.uploadedBy = req.query.uploadedBy;

    const files = await FileEntry.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return res.json(files);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch files',
      error: error.message
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const file = await FileEntry.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    return res.json(file);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch file',
      error: error.message
    });
  }
};

exports.preview = async (req, res) => {
  try {
    const file = await FileEntry.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const absPath = path.resolve(file.storagePath);

    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ message: 'Stored file missing' });
    }

    if (!isPreviewable(file.mimeType || '')) {
      return res.status(400).json({ message: 'File type is not previewable' });
    }

    return res.sendFile(absPath);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to preview file',
      error: error.message
    });
  }
};

exports.download = async (req, res) => {
  try {
    const file = await FileEntry.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const absPath = path.resolve(file.storagePath);

    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ message: 'Stored file missing' });
    }

    await auditService.writeLog({
      req,
      user: req.user,
      module: 'files',
      action: 'download',
      entityType: 'FileEntry',
      entityId: file.id,
      collectionKey: file.collectionKey,
      status: 'success',
      message: 'File downloaded'
    });

    return res.download(absPath, file.originalName);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to download file',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const file = await FileEntry.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const beforeData = file.toJSON();

    if (file.storagePath && fs.existsSync(path.resolve(file.storagePath))) {
      fs.unlinkSync(path.resolve(file.storagePath));
    }

    await file.destroy();

    await auditService.writeLog({
      req,
      user: req.user,
      module: 'files',
      action: 'delete',
      entityType: 'FileEntry',
      entityId: req.params.fileId,
      collectionKey: beforeData.collectionKey,
      status: 'success',
      message: 'File deleted successfully',
      beforeData
    });

    return res.json({ message: 'File deleted successfully' });
  } catch (error) {
    await auditService.writeLog({
      req,
      user: req.user,
      module: 'files',
      action: 'delete',
      entityType: 'FileEntry',
      entityId: req.params.fileId,
      status: 'failed',
      message: error.message
    });

    return res.status(500).json({
      message: 'Failed to delete file',
      error: error.message
    });
  }
};
