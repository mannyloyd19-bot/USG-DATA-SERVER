const express = require('express');
const router = express.Router();
const controller = require('../controllers/app.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/', controller.getApps);
router.post('/', controller.createApp);
router.post('/:id/start', controller.startApp);
router.post('/:id/stop', controller.stopApp);
router.post('/:id/restart', controller.restartApp);
router.delete('/:id', controller.deleteApp);

module.exports = router;
