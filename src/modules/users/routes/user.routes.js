const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { requirePermission } = require('../../../middleware/rbac.middleware');

router.get('/', requirePermission('users.read'), controller.list);
router.post('/', requirePermission('users.write'), controller.create);
router.put('/:id', requirePermission('users.write'), controller.update);
router.delete('/:id', requirePermission('users.write'), controller.remove);

module.exports = router;
