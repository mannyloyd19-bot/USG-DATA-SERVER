const { startJobRunner } = require('./modules/jobQueue/services/start-runner');
const { ensureDomainsTable } = require('./modules/domains/services/domain-migrate');
const { updateDuckDNSFull } = require('./core/domain/duckdns-ipv6');
const { updateDuckDNS } = require('./core/domain/duckdns');
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = require('./app');
const env = require('./core/utils/env');
const sequelize = require('./core/database');

const User = require('./modules/users/models/user.model');
const Permission = require('./modules/permissions/models/permission.model');
const settingController = require('./modules/settings/controllers/setting.controller');
const { startAutoBackup } = require('./modules/backups/services/auto-backup.service');

require('./modules/collections/models/collection.model');
require('./modules/fields/models/field.model');
require('./modules/records/models/record.model');
require('./modules/audit/models/audit-log.model');
require('./modules/files/models/file.model');
require('./modules/apiKeys/models/api-key.model');
require('./modules/relational/models/table.model');
require('./modules/relational/models/column.model');
require('./modules/relational/models/row.model');
require('./modules/settings/models/setting.model');
require('./modules/relationships/models/relationship.model');
require('./modules/webhooks/models/webhook.model');
require('./modules/functions/models/function.model');
require('./modules/installer/models/install-state.model');
require('./modules/apiKeyLogs/models/api-key-log.model');
require('./modules/dbMigration/models/db-migration-state.model');
require('./modules/tenants/models/tenant.model');
require('./modules/tenantMemberships/models/tenant-membership.model');

let server = null;

function applyPendingRestore() {
  const restoreFile = path.join(process.cwd(), 'database.sqlite.restore_pending');
  const dbFile = path.join(process.cwd(), 'database.sqlite');

  if (fs.existsSync(restoreFile)) {
    fs.copyFileSync(restoreFile, dbFile);
    fs.unlinkSync(restoreFile);
    console.log('Pending database restore applied.');
  }
}

async function ensureDefaultAdmin() {
  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ where: { username } });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      password: hashedPassword,
      role: 'super_admin'
    });
    console.log('Default admin created:', username);
  }
}

async function seedDefaultPermissions() {
  const defaults = [
    ['admin', 'collections', 'create'],
    ['admin', 'collections', 'read'],
    ['admin', 'collections', 'update'],
    ['admin', 'collections', 'delete'],
    ['admin', 'fields', 'create'],
    ['admin', 'fields', 'read'],
    ['admin', 'fields', 'update'],
    ['admin', 'fields', 'delete'],
    ['admin', 'records', 'create'],
    ['admin', 'records', 'read'],
    ['admin', 'records', 'update'],
    ['admin', 'records', 'delete'],
    ['admin', 'records', 'restore'],
    ['admin', 'records', 'hard_delete'],
    ['admin', 'files', 'create'],
    ['admin', 'files', 'read'],
    ['admin', 'files', 'delete'],
    ['admin', 'api_keys', 'create'],
    ['admin', 'api_keys', 'read'],
    ['admin', 'api_keys', 'update'],
    ['admin', 'api_keys', 'delete']
  ];

  for (const [role, moduleName, action] of defaults) {
    await Permission.findOrCreate({
      where: { role, module: moduleName, action },
      defaults: { allowed: true }
    });
  }
}

async function start() {
  await ensureDomainsTable();
  await updateDuckDNS();
  try {
    applyPendingRestore();

    await sequelize.authenticate();
    await sequelize.sync();
    await ensureDefaultAdmin();
    await seedDefaultPermissions();
    await settingController.seedDefaults();

    server = app.listen(env.PORT, () => {
      console.log(`USG DATA SERVER running on port ${env.PORT}`);
      startAutoBackup();
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    await sequelize.close();
    console.log('Shutdown complete.');
    process.exit(0);
  } catch (error) {
    console.error('Shutdown failed:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

start();

require('./modules/domains/models/domain.model');

require('./modules/infrastructure/models/infrastructure-config.model');

require('./modules/network/models/network-config.model');

require('./modules/apps/models/app.model');

require('./modules/deployments/models/deployment.model');


setInterval(() => {
  updateDuckDNS();
}, 1000 * 60 * 5);



// AUTO DuckDNS IPv4 + IPv6 update
setTimeout(() => {
  updateDuckDNSFull();
}, 3000);

setInterval(() => {
  updateDuckDNSFull();
}, 1000 * 60 * 5);


require('./modules/backupSystem/models/backup-job.model');

require('./modules/backupSystem/models/backup-config.model');

require('./modules/indexes/models/index.model');

require('./modules/queryBuilderPro/models/saved-query.model');

require('./modules/usageTracking/models/usage-event.model');
require('./modules/jobQueue/models/job-queue.model');
startJobRunner();
require('./modules/sessions/models/session.model');
require('./modules/authProviders/models/auth-provider.model');
require('./modules/rbac/models/role.model');
require('./modules/rbac/models/permission.model');
require('./modules/rbac/models/role-permission.model');
require('./modules/rbac/models/user-role.model');