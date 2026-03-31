const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.controller');

router.get('/', controller.list);
router.post('/', controller.create);
router.post('/:id/mark-paid', controller.markPaid);
router.post('/:id/mark-failed', controller.markFailed);

module.exports = router;
