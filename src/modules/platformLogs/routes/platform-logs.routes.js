const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/platform-logs.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/unified', controller.unified);

module.exports = router;
