const express = require('express');
const router = express.Router();
const controller = require('../controllers/env-manager.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/', controller.list);
router.post('/', controller.save);

module.exports = router;
