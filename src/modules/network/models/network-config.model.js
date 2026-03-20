const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const NetworkConfig = sequelize.define('NetworkConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  routerIp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  localServerIp: {
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
  protocol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'TCP'
  },
  domainGateway: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ddnsDomain: {
    type: DataTypes.STRING,
    allowNull: true
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
  providerMode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'self_hosted'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'network_configs',
  timestamps: true
});

module.exports = NetworkConfig;
