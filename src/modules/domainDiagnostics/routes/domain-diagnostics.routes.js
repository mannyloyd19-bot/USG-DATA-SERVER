const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const controller = require('../controllers/domain-diagnostics.controller');

router.use(authMiddleware);

router.get('/summary', requirePermission('domains.read'), controller.summary);
router.get('/:id', requirePermission('domains.read'), controller.details);
router.post('/:id/ssl-active', requirePermission('domains.write'), controller.markSslActive);
router.post('/:id/ssl-pending', requirePermission('domains.write'), controller.markSslPending);
router.post('/:id/inactive', requirePermission('domains.write'), controller.markInactive);

module.exports = router;
