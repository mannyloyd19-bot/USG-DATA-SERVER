const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const TenantSubscription = sequelize.define('TenantSubscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  planKey: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'free'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },
  currentPeriodStart: {
    type: DataTypes.DATE,
    allowNull: true
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'tenant_subscriptions',
  timestamps: true
});

module.exports = TenantSubscription;
