const express = require('express');
const controller = require('../controllers/user.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:userId', controller.findOne);
router.patch('/:userId', controller.update);
router.delete('/:userId', controller.remove);

module.exports = router;
