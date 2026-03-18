const express = require('express');
const controller = require('../controllers/api-key.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.patch('/:apiKeyId', controller.update);
router.delete('/:apiKeyId', controller.remove);

module.exports = router;
