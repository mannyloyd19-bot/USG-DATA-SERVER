const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const ApiKey = sequelize.define('ApiKey', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'admin'
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: true
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastUsedIp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  scopes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipWhitelist: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'api_keys',
  timestamps: true
});

module.exports = ApiKey;
