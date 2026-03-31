const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
const controller = require('../controllers/record.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', requirePermission('collections.read'), controller.list);
router.post('/', requirePermission('collections.write'), controller.create);
router.put('/:id', requirePermission('collections.write'), controller.update);
router.delete('/:id', requirePermission('collections.write'), controller.remove);

module.exports = router;