const express = require('express');
const controller = require('../controllers/backup.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.post('/restore/:filename', controller.restore);

module.exports = router;
