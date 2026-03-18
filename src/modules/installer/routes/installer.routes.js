const express = require('express');
const controller = require('../controllers/installer.controller');

const router = express.Router();

router.get('/status', controller.status);
router.get('/check', controller.systemCheck);
router.post('/install', controller.install);

module.exports = router;
