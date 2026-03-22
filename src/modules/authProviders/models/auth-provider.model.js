const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const AuthProvider = sequelize.define('AuthProvider', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  providerKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  clientId: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  clientSecret: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  callbackUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scopes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'auth_providers',
  timestamps: true
});

module.exports = AuthProvider;
