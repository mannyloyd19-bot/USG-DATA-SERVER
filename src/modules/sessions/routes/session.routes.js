const express = require('express');
const router = express.Router();
const controller = require('../controllers/session.controller');

router.get('/mine', controller.listMine);
router.post('/logout-current', controller.logoutCurrent);
router.post('/logout-all', controller.logoutAll);

module.exports = router;
