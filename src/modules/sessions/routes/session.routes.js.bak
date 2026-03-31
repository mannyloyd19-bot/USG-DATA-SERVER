const express = require('express');
const router = express.Router();
const controller = require('../controllers/session.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/mine', controller.listMine);
router.post('/logout-current', controller.logoutCurrent);
router.post('/logout-all', controller.logoutAll);

module.exports = router;
