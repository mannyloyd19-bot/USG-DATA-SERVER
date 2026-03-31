const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const controller = require('../controllers/permission.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', controller.createOrUpdate);
router.get('/', controller.findAll);
router.delete('/:permissionId', controller.remove);

module.exports = router;
