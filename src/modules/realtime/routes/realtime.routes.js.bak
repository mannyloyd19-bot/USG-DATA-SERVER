const express = require('express');
const controller = require('../controllers/realtime.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/stream', controller.stream);
router.get('/status', controller.status);

module.exports = router;
