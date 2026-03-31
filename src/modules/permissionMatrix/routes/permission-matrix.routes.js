const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth.middleware');
const controller = require('../controllers/permission-matrix.controller');

router.use(authMiddleware);

router.get('/summary', requirePermission('users.read'), controller.summary);
router.get('/roles', requirePermission('users.read'), controller.roles);
router.patch('/users/:userId/role', requirePermission('users.write'), controller.updateUserRole);

module.exports = router;
