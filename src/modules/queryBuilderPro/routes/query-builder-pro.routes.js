const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/query-builder-pro.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);
router.get('/saved', controller.listSaved);
router.post('/save', controller.save);
router.post('/execute', controller.execute);
router.delete('/saved/:id', controller.deleteOne);

module.exports = router;
