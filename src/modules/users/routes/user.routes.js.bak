const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { requirePermission } = require('../../../middleware/rbac.middleware');

router.use(authMiddleware);

router.get('/', requirePermission('users.read'), controller.findAll);
router.get('/:userId', requirePermission('users.read'), controller.findOne);
router.post('/', requirePermission('users.write'), controller.create);
router.put('/:userId', requirePermission('users.write'), controller.update);
router.delete('/:userId', requirePermission('users.write'), controller.remove);

module.exports = router;
