const express = require('express');
const controller = require('../controllers/permission-matrix.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', controller.getMatrix);
router.post('/', controller.saveMatrix);

module.exports = router;
