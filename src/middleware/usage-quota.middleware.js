const { getTenantUsageSummary, incrementUsage } = require('../modules/billing/services/billing.service');

function requireTenantId(req) {
  return req.tenant?.id || req.headers['x-tenant-id'] || req.query.tenantId || req.body?.tenantId || null;
}

function enforceUsage(metricKey, amount = 1) {
  return async function(req, res, next) {
    try {
      const tenantId = requireTenantId(req);
      if (!tenantId) return next();

      const summary = await getTenantUsageSummary(tenantId);
      const quotas = summary.quotas || {};
      const usage = summary.usage || {};

      const quotaMap = {
        requests: quotas.requestQuota,
        storage_mb: quotas.storageQuotaMb,
        files: quotas.fileQuota,
        domains: quotas.domainQuota
      };

      const usedMap = {
        requests: usage.requestsUsed,
        storage_mb: usage.storageUsedMb,
        files: usage.filesUsed,
        domains: usage.domainsUsed
      };

      const quota = Number(quotaMap[metricKey] || 0);
      const used = Number(usedMap[metricKey] || 0);

      if (quota > 0 && used + Number(amount) > quota) {
        return res.status(402).json({
          success: false,
          message: `Quota exceeded for ${metricKey}`,
          metricKey,
          used,
          quota
        });
      }

      req.billingQuota = { tenantId: String(tenantId), metricKey, amount: Number(amount) };
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

async function commitUsageFromRequest(req) {
  try {
    if (!req.billingQuota) return;
    await incrementUsage(req.billingQuota.tenantId, req.billingQuota.metricKey, req.billingQuota.amount);
  } catch (error) {
    console.error('[billingUsageCommit] error:', error.message);
  }
}

module.exports = {
  enforceUsage,
  commitUsageFromRequest
};
