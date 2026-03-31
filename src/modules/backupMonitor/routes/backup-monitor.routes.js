const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const controller = require('../controllers/backup-monitor.controller');

router.use(authMiddleware);

router.get('/summary', requirePermission('settings.read'), controller.summary);
router.get('/jobs', requirePermission('settings.read'), controller.list);
router.post('/run-now', requirePermission('settings.write'), controller.runNow);

module.exports = router;
