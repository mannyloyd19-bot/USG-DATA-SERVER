const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const controller = require('../controllers/api-key.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', controller.findAll);
router.post('/', controller.create);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/rotate', controller.rotate);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
