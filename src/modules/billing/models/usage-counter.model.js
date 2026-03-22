const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const UsageCounter = sequelize.define('UsageCounter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  metricKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  periodKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'usage_counters',
  timestamps: true
});

module.exports = UsageCounter;
