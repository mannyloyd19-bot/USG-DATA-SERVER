const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/auth-provider.controller');

router.get('/', controller.list);
router.post('/upsert', controller.upsert);
router.post('/seed-defaults', controller.seedDefaults);

module.exports = router;
