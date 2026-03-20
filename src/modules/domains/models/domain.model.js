const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const Domain = sequelize.define('Domain', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'internal'
  },
  targetType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'route'
  },
  target: {
    type: DataTypes.STRING,
    allowNull: false
  },
  internalHost: {
    type: DataTypes.STRING,
    allowNull: true
  },
  externalHost: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publicPath: {
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
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'domains',
  timestamps: true
});

module.exports = Domain;
