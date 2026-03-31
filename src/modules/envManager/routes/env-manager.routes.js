const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/env-manager.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/', controller.list);
router.post('/', controller.save);

module.exports = router;
