require('dotenv').config();
const bcrypt = require('bcrypt');
const app = require('./app');
const sequelize = require('./core/database');
const User = require('./modules/users/models/user.model');
const Permission = require('./modules/permissions/models/permission.model');
require('./modules/collections/models/collection.model');
require('./modules/fields/models/field.model');
require('./modules/records/models/record.model');
require('./modules/audit/models/audit-log.model');
require('./modules/files/models/file.model');
require('./modules/apiKeys/models/api-key.model');

const PORT = process.env.PORT || 3000;

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

  for (const [role, module, action] of defaults) {
    await Permission.findOrCreate({
      where: { role, module, action },
      defaults: { allowed: true }
    });
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureDefaultAdmin();
    await seedDefaultPermissions();

    app.listen(PORT, () => {
      console.log('USG DATA SERVER running on port ' + PORT);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

start();
