const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const controller = require('../controllers/function.controller');
const auth = require('../../../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware);

router.use(auth);

router.post('/', controller.create);
router.get('/', controller.findAll);

module.exports = router;
