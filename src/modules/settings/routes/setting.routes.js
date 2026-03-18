const express = require('express');
const controller = require('../controllers/setting.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', controller.findAll);
router.get('/grouped', controller.findGrouped);
router.get('/system-info', controller.systemInfo);
router.post('/', controller.upsert);
router.patch('/', controller.upsert);
router.delete('/:settingId', controller.remove);

module.exports = router;
