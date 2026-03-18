const express = require('express');
const controller = require('../controllers/record.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:recordId', controller.findOne);
router.patch('/:recordId', controller.update);
router.delete('/:recordId', controller.remove);
router.post('/:recordId/restore', controller.restore);
router.delete('/:recordId/hard', controller.hardDelete);

module.exports = router;
