const express = require('express');
const router = express.Router();
const controller = require('../controllers/collection-stats.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/summary', controller.summary);

module.exports = router;
