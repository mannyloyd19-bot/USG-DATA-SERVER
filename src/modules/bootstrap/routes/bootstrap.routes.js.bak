const express = require('express');
const controller = require('../controllers/bootstrap.controller');
const { checkBootstrapAllowed } = require('../../../middleware/release-lockdown.middleware');

const router = express.Router();

router.post('/create-user', checkBootstrapAllowed, controller.createUserWithMasterKey);
router.post('/reset-password', checkBootstrapAllowed, controller.resetPasswordWithMasterKey);

module.exports = router;
