const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./modules/auth/routes/auth.routes');
const collectionRoutes = require('./modules/collections/routes/collection.routes');
const fieldRoutes = require('./modules/fields/routes/field.routes');
const recordRoutes = require('./modules/records/routes/record.routes');
const permissionRoutes = require('./modules/permissions/routes/permission.routes');
const auditRoutes = require('./modules/audit/routes/audit.routes');
const fileRoutes = require('./modules/files/routes/file.routes');
const userRoutes = require('./modules/users/routes/user.routes');
const dashboardRoutes = require('./modules/dashboard.routes');
const apiKeyRoutes = require('./modules/apiKeys/routes/api-key.routes');
const relationalRoutes = require('./modules/relational/routes/relational.routes');
const settingRoutes = require('./modules/settings/routes/setting.routes');
const backupRoutes = require('./modules/backups/routes/backup.routes');
const relationshipRoutes = require('./modules/relationships/routes/relationship.routes');
const realtimeRoutes = require('./modules/realtime/routes/realtime.routes');
const functionRoutes = require('./modules/functions/routes/function.routes');
const permissionMatrixRoutes = require('./modules/permissionMatrix/routes/permission-matrix.routes');
const webhookRoutes = require('./modules/webhooks/routes/webhook.routes');
const bootstrapRoutes = require('./modules/bootstrap/routes/bootstrap.routes');

const app = express();

if (String(process.env.CORS_ENABLED || 'true') === 'true') {
  app.use(cors());
}

if (String(process.env.HELMET_ENABLED || 'true') === 'true') {
  app.use(helmet({ crossOriginResourcePolicy: false }));
}
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'storage', 'uploads')));
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    system: 'USG DATA SERVER',
    mode: process.env.DB_DIALECT || 'sqlite',
    time: new Date().toISOString()
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
app.use('/api/realtime', realtimeRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/permission-matrix', permissionMatrixRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/bootstrap', bootstrapRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
