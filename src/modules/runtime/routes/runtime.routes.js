const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/runtime.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/status', controller.status);
router.post('/pm2/restart', controller.pm2Restart);
router.post('/pm2/stop', controller.pm2Stop);
router.post('/pm2/start', controller.pm2Start);
router.get('/pm2/logs', controller.pm2Logs);

module.exports = router;
