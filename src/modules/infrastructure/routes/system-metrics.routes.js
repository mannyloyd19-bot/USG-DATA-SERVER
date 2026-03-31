const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/system-metrics.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/metrics', controller.getMetrics);

module.exports = router;
