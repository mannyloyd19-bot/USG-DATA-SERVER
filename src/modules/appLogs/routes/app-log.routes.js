const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const { requirePermission } = require('../../../middleware/rbac.middleware');
const controller = require('../controllers/app-log.controller');

router.use(authMiddleware);

router.get('/', requirePermission('settings.read'), controller.list);
router.get('/apps-summary', requirePermission('settings.read'), controller.appsSummary);
router.post('/test-log', requirePermission('settings.write'), controller.testLog);

module.exports = router;
