const express = require('express');
const router = express.Router();
const controller = require('../controllers/domain-health.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/check', controller.check);

module.exports = router;
