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
app.use('/uploads', express.static(path.join(process.cwd(), 'storage', 'uploads')));
app.use(express.static(path.join(process.cwd(), 'public')));

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

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
