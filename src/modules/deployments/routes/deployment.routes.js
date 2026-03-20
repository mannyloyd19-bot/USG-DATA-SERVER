const express = require('express');
const router = express.Router();
const controller = require('../controllers/deployment.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.post('/:id/deploy', controller.deploy);
router.post('/:id/stop', controller.stop);
router.post('/:id/restart', controller.restart);
router.delete('/:id', controller.deleteOne);

module.exports = router;
