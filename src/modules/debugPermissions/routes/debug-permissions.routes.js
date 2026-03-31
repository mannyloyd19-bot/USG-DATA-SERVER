const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const controller = require('../controllers/debug-permissions.controller');

router.use(authMiddleware);
router.get('/me', controller.me);

module.exports = router;
