const BillingPlan = require('../models/billing-plan.model');
const TenantSubscription = require('../models/tenant-subscription.model');
const {
  ensureDefaultPlans,
  ensureTenantSubscription,
  getTenantUsageSummary
} = require('../services/billing.service');

exports.seedPlans = async (req, res) => {
  try {
    await ensureDefaultPlans();
    const plans = await BillingPlan.findAll({ order: [['monthlyPrice', 'ASC']] });
    return res.json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listPlans = async (req, res) => {
  try {
    const plans = await BillingPlan.findAll({ order: [['monthlyPrice', 'ASC']] });
    return res.json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTenantSummary = async (req, res) => {
  try {
    const tenantId = req.tenant?.id || req.headers['x-tenant-id'] || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'tenantId is required' });
    }

    const summary = await getTenantUsageSummary(tenantId);
    return res.json({ success: true, ...summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.setTenantPlan = async (req, res) => {
  try {
    const { tenantId, planKey } = req.body || {};
    if (!tenantId || !planKey) {
      return res.status(400).json({ success: false, message: 'tenantId and planKey are required' });
    }

    const plan = await BillingPlan.findOne({ where: { key: String(planKey) } });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const sub = await ensureTenantSubscription(tenantId);
    sub.planKey = plan.key;
    sub.status = 'active';
    await sub.save();

    return res.json({ success: true, subscription: sub });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listSubscriptions = async (req, res) => {
  try {
    const rows = await TenantSubscription.findAll({ order: [['updatedAt', 'DESC']] });
    return res.json({ success: true, subscriptions: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
