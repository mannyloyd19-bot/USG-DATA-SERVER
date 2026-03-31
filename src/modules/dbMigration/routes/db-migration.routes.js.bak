const express = require('express');
const controller = require('../controllers/db-migration.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/latest', controller.getLatest);
router.post('/draft', controller.saveDraft);
router.post('/test-connection', controller.testConnection);
router.post('/dry-run', controller.dryRun);
router.post('/run', controller.runMigration);
router.post('/verify', controller.verifyMigration);

module.exports = router;
