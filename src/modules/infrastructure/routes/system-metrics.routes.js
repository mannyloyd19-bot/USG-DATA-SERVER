const express = require('express');
const router = express.Router();
const controller = require('../controllers/system-metrics.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/metrics', controller.getMetrics);

module.exports = router;
