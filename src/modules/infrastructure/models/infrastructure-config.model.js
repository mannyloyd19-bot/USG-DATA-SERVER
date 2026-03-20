const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const InfrastructureConfig = sequelize.define('InfrastructureConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  mode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'on_prem'
  },
  domainType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ddns'
  },
  customDomain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subdomain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ddnsProvider: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'duckdns'
  },
  ddnsDomain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ddnsToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  appPort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3000
  },
  publicPort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3000
  },
  sslEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  reverseProxyEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'infrastructure_configs',
  timestamps: true
});

module.exports = InfrastructureConfig;
