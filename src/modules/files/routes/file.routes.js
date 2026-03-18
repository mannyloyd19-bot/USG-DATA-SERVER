const express = require('express');
const controller = require('../controllers/file.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const upload = require('../services/upload.service');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/upload',
  requirePermission('files', 'create'),
  upload.single('file'),
  controller.uploadSingle
);

router.get(
  '/',
  requirePermission('files', 'read'),
  controller.findAll
);

router.get(
  '/:fileId',
  requirePermission('files', 'read'),
  controller.findOne
);

router.get(
  '/:fileId/download',
  requirePermission('files', 'read'),
  controller.download
);

router.delete(
  '/:fileId',
  requirePermission('files', 'delete'),
  controller.remove
);

module.exports = router;
