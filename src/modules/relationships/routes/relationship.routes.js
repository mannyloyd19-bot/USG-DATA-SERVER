const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const controller = require('../controllers/relationship.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.delete('/:relationshipId', controller.remove);

module.exports = router;
