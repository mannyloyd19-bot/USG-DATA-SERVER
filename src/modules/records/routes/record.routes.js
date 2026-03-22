const express = require('express');
const router = express.Router();
const controller = require('../controllers/record.controller');
const { requirePermission } = require('../../../middleware/rbac.middleware');

router.get('/', requirePermission('collections.read'), controller.list);
router.post('/', requirePermission('collections.write'), controller.create);
router.put('/:id', requirePermission('collections.write'), controller.update);
router.delete('/:id', requirePermission('collections.write'), controller.remove);

module.exports = router;
