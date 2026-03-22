const express = require('express');
const router = express.Router();
const controller = require('../controllers/webhook-advanced.controller');

router.get('/deliveries', controller.listDeliveries);
router.post('/:id/test', controller.testWebhook);
router.post('/deliveries/:id/retry', controller.retryOne);

module.exports = router;
