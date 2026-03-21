const express = require('express');
const router = express.Router();
const controller = require('../controllers/ssl-center.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/status', controller.status);

module.exports = router;
