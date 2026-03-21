const express = require('express');
const router = express.Router();
const controller = require('../controllers/env.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/', controller.list);

module.exports = router;
