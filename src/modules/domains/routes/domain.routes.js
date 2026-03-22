const express = require('express');
const router = express.Router();
const controller = require('../controllers/domain.controller');
const { requirePermission } = require('../../../middleware/rbac.middleware');

router.get('/', requirePermission('domains.read'), controller.list);
router.post('/', requirePermission('domains.write'), controller.create);
router.get('/:id', requirePermission('domains.read'), controller.details);
router.put('/:id', requirePermission('domains.write'), controller.update);
router.delete('/:id', requirePermission('domains.write'), controller.remove);

module.exports = router;
