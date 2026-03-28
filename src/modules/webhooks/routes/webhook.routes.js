const express = require('express');
const controller = require('../controllers/webhook.controller');
const auth = require('../../../middleware/auth.middleware');

const router = express.Router();

router.use(auth);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.delete('/:id', controller.remove);

module.exports = router;
