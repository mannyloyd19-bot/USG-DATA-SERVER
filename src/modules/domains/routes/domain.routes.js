const express = require('express');
const router = express.Router();
const controller = require('../controllers/domain.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.get('/:id/details', controller.details);
router.delete('/:id', controller.remove);

module.exports = router;
