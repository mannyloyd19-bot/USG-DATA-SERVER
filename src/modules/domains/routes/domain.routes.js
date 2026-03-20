const express = require('express');
const router = express.Router();
const controller = require('../controllers/domain.controller');
const auth = require('../../../middleware/auth.middleware');

router.use(auth);

router.get('/', controller.getDomains);
router.post('/', controller.createDomain);
router.put('/:id', controller.updateDomain);
router.get('/:id/nginx-preview', controller.nginxPreview);
router.delete('/:id', controller.deleteDomain);

module.exports = router;
