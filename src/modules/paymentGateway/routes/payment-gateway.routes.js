const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/payment-gateway.controller');

router.get('/health', controller.health);
router.post('/checkout', controller.createCheckout);
router.post('/webhook/:provider', controller.receiveWebhook);

module.exports = router;
