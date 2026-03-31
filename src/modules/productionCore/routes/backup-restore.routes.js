const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/backup-restore.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.post('/restore', controller.restore);

module.exports = router;
