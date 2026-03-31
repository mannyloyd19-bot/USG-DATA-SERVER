const express = require('express');
const controller = require('../controllers/audit.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', controller.findAll);
router.get('/:logId', controller.findOne);

module.exports = router;
