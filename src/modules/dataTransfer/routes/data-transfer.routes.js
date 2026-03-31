const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const authMiddleware = require('../../../middleware/auth.middleware');
const controller = require('../controllers/data-transfer.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/export/collections', controller.exportCollections);
router.get('/export/collections/:collectionKey', controller.exportCollectionBundle);
router.post('/import/collections/:collectionKey/records', controller.importCollectionRecords);

module.exports = router;
