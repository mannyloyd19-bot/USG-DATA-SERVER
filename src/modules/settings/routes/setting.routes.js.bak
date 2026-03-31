const express = require('express');
const controller = require('../controllers/setting.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
