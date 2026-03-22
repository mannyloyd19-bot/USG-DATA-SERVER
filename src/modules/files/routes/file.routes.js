const express = require('express');
const router = express.Router();
const controller = require('../controllers/file.controller');
const { requirePermission } = require('../../../middleware/rbac.middleware');

router.get('/', requirePermission('files.read'), controller.list);
router.post('/', requirePermission('files.write'), controller.create);
router.put('/:id', requirePermission('files.write'), controller.update);
router.delete('/:id', requirePermission('files.write'), controller.remove);

module.exports = router;
