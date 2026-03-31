const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/env.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/', controller.list);

module.exports = router;
