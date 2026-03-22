const BillingPlan = require('../models/billing-plan.model');
const TenantSubscription = require('../models/tenant-subscription.model');
const UsageCounter = require('../models/usage-counter.model');

function getPeriodKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function ensureDefaultPlans() {
  const defaults = [
    {
      key: 'free',
      name: 'Free',
      monthlyPrice: 0,
      requestQuota: 5000,
      storageQuotaMb: 512,
      fileQuota: 100,
      domainQuota: 1,
      featuresJson: JSON.stringify(['basic-db', 'basic-auth'])
    },
    {
      key: 'pro',
      name: 'Pro',
      monthlyPrice: 29,
      requestQuota: 100000,
      storageQuotaMb: 10240,
      fileQuota: 5000,
      domainQuota: 10,
      featuresJson: JSON.stringify(['db', 'auth', 'domains', 'storage', 'analytics'])
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 199,
      requestQuota: 1000000,
      storageQuotaMb: 102400,
      fileQuota: 50000,
      domainQuota: 100,
      featuresJson: JSON.stringify(['all'])
    }
  ];

  for (const item of defaults) {
    const existing = await BillingPlan.findOne({ where: { key: item.key } });
    if (!existing) await BillingPlan.create(item);
  }
}

async function ensureTenantSubscription(tenantId) {
  let sub = await TenantSubscription.findOne({ where: { tenantId: String(tenantId) } });
  if (!sub) {
    const now = new Date();
    const next = new Date(now);
    next.setUTCMonth(next.getUTCMonth() + 1);
    sub = await TenantSubscription.create({
      tenantId: String(tenantId),
      planKey: 'free',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: next
    });
  }
  return sub;
}

async function getTenantPlan(tenantId) {
  const sub = await ensureTenantSubscription(tenantId);
  const plan = await BillingPlan.findOne({ where: { key: sub.planKey } });
  return { subscription: sub, plan };
}

async function getUsageValue(tenantId, metricKey, periodKey = getPeriodKey()) {
  const row = await UsageCounter.findOne({
    where: { tenantId: String(tenantId), metricKey, periodKey }
  });
  return row ? Number(row.value || 0) : 0;
}

async function incrementUsage(tenantId, metricKey, amount = 1, periodKey = getPeriodKey()) {
  let row = await UsageCounter.findOne({
    where: { tenantId: String(tenantId), metricKey, periodKey }
  });

  if (!row) {
    row = await UsageCounter.create({
      tenantId: String(tenantId),
      metricKey,
      periodKey,
      value: 0
    });
  }

  row.value = Number(row.value || 0) + Number(amount || 1);
  await row.save();
  return row;
}

async function getTenantUsageSummary(tenantId) {
  const { subscription, plan } = await getTenantPlan(tenantId);
  const periodKey = getPeriodKey();

  const [requestsUsed, storageUsedMb, filesUsed, domainsUsed] = await Promise.all([
    getUsageValue(tenantId, 'requests', periodKey),
    getUsageValue(tenantId, 'storage_mb', periodKey),
    getUsageValue(tenantId, 'files', periodKey),
    getUsageValue(tenantId, 'domains', periodKey)
  ]);

  return {
    subscription,
    plan,
    usage: {
      periodKey,
      requestsUsed,
      storageUsedMb,
      filesUsed,
      domainsUsed
    },
    quotas: {
      requestQuota: Number(plan?.requestQuota || 0),
      storageQuotaMb: Number(plan?.storageQuotaMb || 0),
      fileQuota: Number(plan?.fileQuota || 0),
      domainQuota: Number(plan?.domainQuota || 0)
    }
  };
}

module.exports = {
  getPeriodKey,
  ensureDefaultPlans,
  ensureTenantSubscription,
  getTenantPlan,
  getUsageValue,
  incrementUsage,
  getTenantUsageSummary
};
