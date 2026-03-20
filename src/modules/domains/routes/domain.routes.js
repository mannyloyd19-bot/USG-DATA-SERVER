const express = require('express');
const router = express.Router();
const controller = require('../controllers/domain.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.get('/:id/preview', controller.preview);
router.delete('/:id', controller.deleteOne);

module.exports = router;
