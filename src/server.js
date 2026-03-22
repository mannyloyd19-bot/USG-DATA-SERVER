const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./core/database');

require('./modules/rbac/models/role.model');
require('./modules/rbac/models/permission.model');
require('./modules/rbac/models/role-permission.model');
require('./modules/rbac/models/user-role.model');
require('./modules/sessions/models/session.model');
require('./modules/authProviders/models/auth-provider.model');
require('./modules/billing/models/billing-plan.model');
require('./modules/billing/models/tenant-subscription.model');
require('./modules/billing/models/usage-counter.model');
require('./modules/payments/models/payment.model');
require('./modules/invoices/models/invoice.model');

const app = require('./app');

const PORT = process.env.PORT || 3000;

async function boot() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server boot failed:', error);
    process.exit(1);
  }
}

boot();
