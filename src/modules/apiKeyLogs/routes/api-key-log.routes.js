const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const controller = require('../controllers/api-key-log.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.findAll);

module.exports = router;
