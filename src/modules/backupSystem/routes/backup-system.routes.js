const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/backup-system.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/status', controller.status);
router.post('/run', controller.runNow);
router.post('/config', controller.saveConfig);
router.post('/enable-auto', controller.enableAuto);
router.post('/disable-auto', controller.disableAuto);

module.exports = router;
