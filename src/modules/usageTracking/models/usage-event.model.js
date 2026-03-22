const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const UsageEvent = sequelize.define('UsageEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  domainId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tenantId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  route: {
    type: DataTypes.STRING,
    allowNull: true
  },
  method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'usage_events',
  timestamps: true
});

module.exports = UsageEvent;
