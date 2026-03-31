const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const controller = require('../controllers/auth-security.controller');

router.use(authMiddleware);

router.get('/summary', requirePermission('settings.read'), controller.summary);
router.get('/providers', requirePermission('settings.read'), controller.providers);
router.get('/sessions', requirePermission('settings.read'), controller.sessions);
router.post('/sessions/revoke-current', requirePermission('settings.write'), controller.revokeCurrent);
router.post('/sessions/revoke-all', requirePermission('settings.write'), controller.revokeAll);

module.exports = router;
