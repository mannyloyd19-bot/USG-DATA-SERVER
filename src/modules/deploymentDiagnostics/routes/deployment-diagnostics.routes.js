const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const controller = require('../controllers/deployment-diagnostics.controller');

router.use(authMiddleware);

router.get('/summary', requirePermission('settings.read'), controller.summary);
router.get('/deployments', requirePermission('settings.read'), controller.list);
router.post('/deployments/:id/mark-success', requirePermission('settings.write'), controller.markSuccess);
router.post('/deployments/:id/mark-failed', requirePermission('settings.write'), controller.markFailed);

module.exports = router;
