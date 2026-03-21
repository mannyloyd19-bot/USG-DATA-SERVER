const express = require('express');
const router = express.Router();
const controller = require('../controllers/domain-binding.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/:id', controller.getBinding);
router.post('/:id/ensure', controller.ensureBinding);

module.exports = router;
