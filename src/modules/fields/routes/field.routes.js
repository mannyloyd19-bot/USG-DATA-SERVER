const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const controller = require('../controllers/field.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', requirePermission('collections.write'), controller.create);
router.get('/', requirePermission('collections.read'), controller.findAll);
router.get('/:fieldId', requirePermission('collections.read'), controller.findOne);
router.patch('/:fieldId', requirePermission('collections.write'), controller.update);
router.delete('/:fieldId', requirePermission('collections.write'), controller.remove);

module.exports = router;
