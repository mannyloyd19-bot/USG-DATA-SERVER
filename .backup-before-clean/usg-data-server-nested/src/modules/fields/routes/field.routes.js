const express = require('express');
const controller = require('../controllers/field.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:fieldId', controller.findOne);
router.patch('/:fieldId', controller.update);
router.delete('/:fieldId', controller.remove);

module.exports = router;
