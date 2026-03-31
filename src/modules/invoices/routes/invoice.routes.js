const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/invoice.controller');

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.details);
router.post('/:id/mark-paid', controller.markPaid);

module.exports = router;
