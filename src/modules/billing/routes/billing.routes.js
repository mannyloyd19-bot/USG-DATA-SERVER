const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);
const controller = require('../controllers/billing.controller');

router.post('/seed-plans', controller.seedPlans);
router.get('/plans', controller.listPlans);
router.get('/tenant-summary', controller.getTenantSummary);
router.post('/set-plan', controller.setTenantPlan);
router.get('/subscriptions', controller.listSubscriptions);

module.exports = router;
