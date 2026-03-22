const express = require('express');
const router = express.Router();
const controller = require('../controllers/realtime-core.controller');

router.get('/stream', controller.stream);
router.get('/recent', controller.recent);
router.post('/emit', controller.testEmit);

module.exports = router;
