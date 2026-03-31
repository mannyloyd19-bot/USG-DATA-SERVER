const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const { requirePermission } = require('../../../middleware/rbac.middleware');
const controller = require('../controllers/queue-monitor.controller');

router.use(authMiddleware);

router.get('/summary', requirePermission('settings.read'), controller.summary);
router.get('/jobs', requirePermission('settings.read'), controller.list);
router.post('/jobs/:id/retry', requirePermission('settings.write'), controller.retry);
router.post('/jobs/:id/cancel', requirePermission('settings.write'), controller.cancel);

module.exports = router;
