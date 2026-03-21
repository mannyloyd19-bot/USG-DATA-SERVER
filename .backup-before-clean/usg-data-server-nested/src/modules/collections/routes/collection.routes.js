const express = require('express');
const controller = require('../controllers/collection.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:key', controller.findOne);
router.patch('/:key', controller.update);
router.delete('/:key', controller.remove);

module.exports = router;
