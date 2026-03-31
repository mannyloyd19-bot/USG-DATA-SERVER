const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const controller = require('../controllers/system-monitoring.controller');

router.use(authMiddleware);

router.get('/health', requirePermission('settings.read'), controller.health);
router.get('/metrics', requirePermission('settings.read'), controller.metrics);
router.get('/runtime', requirePermission('settings.read'), controller.runtime);

module.exports = router;
