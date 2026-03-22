const express = require('express');
const router = express.Router();
const controller = require('../controllers/storage-bucket.controller');

router.get('/', controller.listBuckets);
router.post('/', controller.createBucket);
router.get('/:id/files', controller.listFilesByBucket);
router.post('/files/:fileId/sign', controller.generateFileSignedUrl);
router.get('/files/:fileId/access', controller.accessFile);

module.exports = router;
