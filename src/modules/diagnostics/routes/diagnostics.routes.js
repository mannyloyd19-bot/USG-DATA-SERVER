const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../src/middleware/auth.middleware');
const { requirePermission } = require('../../../src/middleware/rbac.middleware');
const controller = require('../controllers/diagnostics.controller');

router.use(authMiddleware);

router.get('/logs', requirePermission('settings.read'), controller.logs);
router.get('/console', requirePermission('settings.read'), controller.diagnostics);
router.post('/test-log', requirePermission('settings.write'), controller.testLog);

module.exports = router;
