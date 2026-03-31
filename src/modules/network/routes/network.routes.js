const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/network.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/config', controller.getConfig);
router.post('/config', controller.saveConfig);
router.get('/checklist', controller.checklist);

module.exports = router;
