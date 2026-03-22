const deploymentDiagnosticsRoutes = require('./modules/deploymentDiagnostics/routes/deployment-diagnostics.routes');
const appLogRoutes = require('./modules/appLogs/routes/app-log.routes');
const backupMonitorRoutes = require('./modules/backupMonitor/routes/backup-monitor.routes');
const queueMonitorRoutes = require('./modules/queueMonitor/routes/queue-monitor.routes');
const requestLogMiddleware = require('./middleware/request-log.middleware');
const diagnosticsRoutes = require('./modules/diagnostics/routes/diagnostics.routes');
const systemMonitoringRoutes = require('./modules/systemMonitoring/routes/system-monitoring.routes');
const paymentGatewayRoutes = require('./modules/paymentGateway/routes/payment-gateway.routes');
const invoiceRoutes = require('./modules/invoices/routes/invoice.routes');
const paymentRoutes = require('./modules/payments/routes/payment.routes');
const { enforceUsage, commitUsageFromRequest } = require('./middleware/usage-quota.middleware');
const billingRoutes = require('./modules/billing/routes/billing.routes');
const rowLevelSecurityMiddleware = require('./middleware/row-level-security.middleware');
const rbacRoutes = require('./modules/rbac/routes/rbac.routes');
const authProviderRoutes = require('./modules/authProviders/routes/auth-provider.routes');
const sessionRoutes = require('./modules/sessions/routes/session.routes');
const storageBucketRoutes = require('./modules/storageBuckets/routes/storage-bucket.routes');
const webhookAdvancedRoutes = require('./modules/webhookAdvanced/routes/webhook-advanced.routes');
const realtimeCoreRoutes = require('./modules/realtimeCore/routes/realtime-core.routes');
const enterpriseDbRoutes = require('./modules/enterpriseDb/routes/enterprise-db.routes');
const apiKeyAnalyticsRoutes = require('./modules/apiKeyAnalytics/routes/api-key-analytics.routes');
const multiTenantRoutes = require('./modules/multiTenant/routes/multi-tenant.routes');
const multiTenantEnforcerMiddleware = require('./middleware/multi-tenant-enforcer.middleware');
const advancedSystemRoutes = require('./modules/advancedSystem/routes/advanced-system.routes');
const jobQueueRoutes = require('./modules/jobQueue/routes/job-queue.routes');
const usageTrackingRoutes = require('./modules/usageTracking/routes/usage-tracking.routes');
const advancedRateLimitMiddleware = require('./middleware/advanced-rate-limit.middleware');
const usageTrackerMiddleware = require('./middleware/usage-tracker.middleware');
const tenantIsolationMiddleware = require('./middleware/tenant-isolation.middleware');
const domainBindingRoutes = require('./modules/domainBindings/routes/domain-binding.routes');
const finalPolishRoutes = require('./modules/finalPolish/routes/final-polish.routes');
const finalReadinessRoutes = require('./modules/finalReadiness/routes/final-readiness.routes');
const envManagerRoutes = require('./modules/envManager/routes/env-manager.routes');
const sslCenterRoutes = require('./modules/sslCenter/routes/ssl-center.routes');
const envRoutes = require('./modules/productionCore/routes/env.routes');
const domainHealthRoutes = require('./modules/productionCore/routes/domain-health.routes');
const backupRestoreRoutes = require('./modules/productionCore/routes/backup-restore.routes');
const realtimeInsightsRoutes = require('./modules/realtimeInsights/routes/realtime-insights.routes');
const hostingHealthRoutes = require('./modules/hostingHealth/routes/hosting-health.routes');
const tenantUsageRoutes = require('./modules/tenantUsage/routes/tenant-usage.routes');
const queryBuilderProRoutes = require('./modules/queryBuilderPro/routes/query-builder-pro.routes');
const platformLogsRoutes = require('./modules/platformLogs/routes/platform-logs.routes');
const platformAnalyticsRoutes = require('./modules/platformAnalytics/routes/platform-analytics.routes');
const liveReadinessRoutes = require('./modules/liveReadiness/routes/live-readiness.routes');
const collectionStatsRoutes = require('./modules/collectionStats/routes/collection-stats.routes');
const indexRoutes = require('./modules/indexes/routes/index.routes');
const backupSystemRoutes = require('./modules/backupSystem/routes/backup-system.routes');
const systemMetricsRoutes = require('./modules/infrastructure/routes/system-metrics.routes');
const systemAuditRoutes = require('./modules/systemAudit/routes/system-audit.routes');
const infrastructureRoutes = require('./modules/infrastructure/routes/infrastructure.routes');
const deploymentRoutes = require('./modules/deployments/routes/deployment.routes');
const appRoutes = require('./modules/apps/routes/app.routes');
const networkRoutes = require('./modules/network/routes/network.routes');
const runtimeRoutes = require('./modules/runtime/routes/runtime.routes');
const ddnsRoutes = require('./modules/ddns/routes/ddns.routes');
const domainRouter = require('./core/domain-routing/domainRouter');
const domainRoutes = require('./modules/domains/routes/domain.routes');
const domainDebug = require('./modules/domains/routes/domain.debug');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const env = require('./core/utils/env');
const requestIdMiddleware = require('./core/middleware/request-id.middleware');
const errorHandler = require('./core/middleware/error-handler.middleware');
const notFoundHandler = require('./core/middleware/not-found.middleware');

const authRoutes = require('./modules/auth/routes/auth.routes');
const userRoutes = require('./modules/users/routes/user.routes');
const dashboardRoutes = require('./modules/dashboard.routes');
const collectionRoutes = require('./modules/collections/routes/collection.routes');
const fieldRoutes = require('./modules/fields/routes/field.routes');
const recordRoutes = require('./modules/records/routes/record.routes');
const permissionRoutes = require('./modules/permissions/routes/permission.routes');
const auditRoutes = require('./modules/audit/routes/audit.routes');
const fileRoutes = require('./modules/files/routes/file.routes');
const apiKeyRoutes = require('./modules/apiKeys/routes/api-key.routes');
const relationalRoutes = require('./modules/relational/routes/relational.routes');
const settingRoutes = require('./modules/settings/routes/setting.routes');
const backupRoutes = require('./modules/backups/routes/backup.routes');
const relationshipRoutes = require('./modules/relationships/routes/relationship.routes');
const webhookRoutes = require('./modules/webhooks/routes/webhook.routes');
const realtimeRoutes = require('./modules/realtime/routes/realtime.routes');
const functionRoutes = require('./modules/functions/routes/function.routes');
const permissionMatrixRoutes = require('./modules/permissionMatrix/routes/permission-matrix.routes');
const installerRoutes = require('./modules/installer/routes/installer.routes');
const sdkRoutes = require('./modules/sdk/routes/sdk.routes');
const systemRoutes = require('./modules/system/routes/system.routes');
const bootstrapRoutes = require('./modules/bootstrap/routes/bootstrap.routes');
const apiKeyLogRoutes = require('./modules/apiKeyLogs/routes/api-key-log.routes');
const dbMigrationRoutes = require('./modules/dbMigration/routes/db-migration.routes');
const tenantRoutes = require('./modules/tenants/routes/tenant.routes');
const tenantMembershipRoutes = require('./modules/tenantMemberships/routes/tenant-membership.routes');
const tenantContextMiddleware = require('./middleware/tenant-context.middleware');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'storage', 'uploads')));

app.use(domainRouter);

app.disable('x-powered-by');
app.use(requestIdMiddleware);

if (env.CORS_ENABLED) {
  app.use(cors());
}

if (env.HELMET_ENABLED) {
  app.use(helmet({ crossOriginResourcePolicy: false }));
}

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(tenantContextMiddleware);
app.use(rowLevelSecurityMiddleware);
app.use('/api', enforceUsage('requests', 1));
app.use(multiTenantEnforcerMiddleware);
app.use(tenantIsolationMiddleware);
app.use(advancedRateLimitMiddleware);
app.use(usageTrackerMiddleware);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    system: 'USG DATA SERVER',
    mode: env.DB_DIALECT,
    environment: env.NODE_ENV,
    time: new Date().toISOString(),
    requestId: req.requestId
  });
});

app.get('/health/details', (req, res) => {
  res.json({
    success: true,
    data: {
      environment: env.NODE_ENV,
      database: env.DB_DIALECT,
      jwtConfigured: Boolean(env.JWT_SECRET),
      installerEnabled: env.INSTALLER_ENABLED,
      releaseLockdown: env.RELEASE_LOCKDOWN,
      corsEnabled: env.CORS_ENABLED,
      helmetEnabled: env.HELMET_ENABLED,
      requestId: req.requestId
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/collections/:collectionKey/fields', fieldRoutes);
app.use('/api/collections/:collectionKey/records', recordRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/relational', relationalRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/permission-matrix', permissionMatrixRoutes);
app.use('/api/installer', installerRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/bootstrap', bootstrapRoutes);
app.use('/api/api-key-logs', apiKeyLogRoutes);
app.use('/api/db-migration', dbMigrationRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/tenant-memberships', tenantMembershipRoutes);
app.use('/sdk', sdkRoutes);

app.use('/api/domains', domainRoutes);
app.use('/debug', domainDebug);
app.use('/api/ddns', ddnsRoutes);
app.use('/api/runtime', runtimeRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/infrastructure', infrastructureRoutes);
app.use('/api/system-audit', systemAuditRoutes);
app.use('/api/system-metrics', systemMetricsRoutes);
app.use('/api/backup-system', backupSystemRoutes);
app.use('/api/indexes', indexRoutes);
app.use('/api/collection-stats', collectionStatsRoutes);

app.use('/api/live-readiness', liveReadinessRoutes);
app.use('/api/platform-analytics', platformAnalyticsRoutes);
app.use('/api/platform-logs', platformLogsRoutes);
app.use('/api/query-builder-pro', queryBuilderProRoutes);
app.use('/api/tenant-usage', tenantUsageRoutes);
app.use('/api/hosting-health', hostingHealthRoutes);
app.use('/api/realtime-insights', realtimeInsightsRoutes);
app.use('/api/backup-restore', backupRestoreRoutes);
app.use('/api/domain-health', domainHealthRoutes);
app.use('/api/env', envRoutes);
app.use('/api/ssl-center', sslCenterRoutes);
app.use('/api/env-manager', envManagerRoutes);
app.use('/api/final-readiness', finalReadinessRoutes);
app.use('/api/final-polish', finalPolishRoutes);
app.use('/api/domain-bindings', domainBindingRoutes);
app.use('/api/usage-tracking', usageTrackingRoutes);
app.use('/api/job-queue', jobQueueRoutes);
app.use('/api/advanced-system', advancedSystemRoutes);
app.use('/api/multi-tenant', multiTenantRoutes);
app.use('/api/api-key-analytics', apiKeyAnalyticsRoutes);
app.use('/api/enterprise-db', enterpriseDbRoutes);
app.use('/api/realtime-core', realtimeCoreRoutes);
app.use('/api/webhook-advanced', webhookAdvancedRoutes);
app.use('/api/storage-buckets', storageBucketRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/auth-providers', authProviderRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/billing', billingRoutes);
app.use((req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode < 400) {
      await commitUsageFromRequest(req);
    }
  });
  next();
});

app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payment-gateway', paymentGatewayRoutes);
app.use('/api/system-monitoring', systemMonitoringRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/queue-monitor', queueMonitorRoutes);
app.use('/api/backup-monitor', backupMonitorRoutes);
app.use('/api/app-logs', appLogRoutes);
app.use('/api/deployment-diagnostics', deploymentDiagnosticsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
