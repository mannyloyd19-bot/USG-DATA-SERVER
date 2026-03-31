const express = require('express');
const router = express.Router();
const controller = require('../controllers/network.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/config', controller.getConfig);
router.post('/config', controller.saveConfig);
router.get('/checklist', controller.checklist);

module.exports = router;
