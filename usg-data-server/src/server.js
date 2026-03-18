require('dotenv').config();
const bcrypt = require('bcrypt');
const app = require('./app');
const sequelize = require('./core/database');
const User = require('./modules/users/models/user.model');
require('./modules/collections/models/collection.model');
require('./modules/fields/models/field.model');

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

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureDefaultAdmin();

    app.listen(PORT, () => {
      console.log('USG DATA SERVER running on port ' + PORT);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

start();
