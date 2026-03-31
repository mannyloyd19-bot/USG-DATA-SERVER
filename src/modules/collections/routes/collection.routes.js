const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
const controller = require('../controllers/collection.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const fieldRoutes = require('../../fields/routes/field.routes');

router.use(authMiddleware);
router.use('/:collectionKey/fields', fieldRoutes);

router.get('/', requirePermission('collections.read'), controller.list);
router.post('/', requirePermission('collections.write'), controller.create);
router.put('/:id', requirePermission('collections.write'), controller.update);
router.delete('/:id', requirePermission('collections.write'), controller.remove);

module.exports = router;
