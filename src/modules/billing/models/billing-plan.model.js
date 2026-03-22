const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const BillingPlan = sequelize.define('BillingPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  monthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  requestQuota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1000
  },
  storageQuotaMb: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 512
  },
  fileQuota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  domainQuota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  featuresJson: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'billing_plans',
  timestamps: true
});

module.exports = BillingPlan;
