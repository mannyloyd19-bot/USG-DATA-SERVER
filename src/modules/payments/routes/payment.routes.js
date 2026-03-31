const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/payment.controller');

router.get('/', controller.list);
router.post('/', controller.create);
router.post('/:id/mark-paid', controller.markPaid);
router.post('/:id/mark-failed', controller.markFailed);

module.exports = router;
