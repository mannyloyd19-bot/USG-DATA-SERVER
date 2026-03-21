const express = require('express');
const router = express.Router();
const controller = require('../controllers/ddns.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/status', controller.status);
router.post('/run', controller.runUpdate);
router.post('/enable-auto', controller.enableAuto);
router.post('/disable-auto', controller.disableAuto);

module.exports = router;
