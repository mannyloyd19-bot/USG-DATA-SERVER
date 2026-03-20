const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const Domain = sequelize.define('Domain', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serviceName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  routePath: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '/'
  },
  accessMode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'internal'
  },
  environment: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'production'
  },
  domainKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publicAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  routingMode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'path'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },
  sslStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'domains',
  timestamps: true
});

module.exports = Domain;
