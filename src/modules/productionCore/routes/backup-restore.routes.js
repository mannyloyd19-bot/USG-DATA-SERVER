const express = require('express');
const router = express.Router();
const controller = require('../controllers/backup-restore.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.post('/restore', controller.restore);

module.exports = router;
