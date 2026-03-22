const express = require('express');
const router = express.Router();
const controller = require('../controllers/file.controller');
const { requirePermission } = require('../../../middleware/rbac.middleware');
const authMiddleware = require('../../../middleware/auth.middleware');
const upload = require('../../../middleware/upload.middleware');

router.use(authMiddleware);

router.get('/', requirePermission('files.read'), controller.findAll);
router.get('/:fileId', requirePermission('files.read'), controller.findOne);
router.get('/:fileId/preview', requirePermission('files.read'), controller.preview);
router.get('/:fileId/download', requirePermission('files.read'), controller.download);
router.post('/', requirePermission('files.write'), upload.single('file'), controller.uploadSingle);
router.delete('/:fileId', requirePermission('files.write'), controller.remove);

module.exports = router;
