const express = require('express');
const controller = require('../controllers/infrastructure.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/config', controller.getConfig);
router.post('/config', controller.saveConfig);
router.get('/global-status', controller.globalStatus);
router.get('/ssl-status', controller.sslStatus);

module.exports = router;
