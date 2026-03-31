const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment-gateway.controller');

router.get('/health', controller.health);
router.post('/checkout', controller.createCheckout);
router.post('/webhook/:provider', controller.receiveWebhook);

module.exports = router;
