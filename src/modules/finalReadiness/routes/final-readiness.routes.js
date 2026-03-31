const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/final-readiness.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/boot-status', controller.bootStatus);
router.get('/lock-status', controller.lockStatus);

module.exports = router;
