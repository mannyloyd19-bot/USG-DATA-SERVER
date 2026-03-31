const express = require('express');
const controller = require('../controllers/auth.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.post('/login', controller.login);
router.get('/me', authMiddleware, controller.me);

module.exports = router;
