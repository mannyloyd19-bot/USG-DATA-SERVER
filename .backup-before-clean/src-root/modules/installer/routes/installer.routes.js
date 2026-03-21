const express = require('express');
const controller = require('../controllers/installer.controller');
const { checkInstallerAllowed } = require('../../../middleware/release-lockdown.middleware');

const router = express.Router();

router.get('/status', controller.status);
router.get('/check', controller.systemCheck);
router.post('/install', checkInstallerAllowed, controller.install);

module.exports = router;
