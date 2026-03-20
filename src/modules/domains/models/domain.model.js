const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const Domain = sequelize.define('Domain', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Domain Name is required' }
    }
  },
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Service Name is required' }
    }
  },
  routePath: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '/',
    validate: {
      notEmpty: { msg: 'Route Path is required' }
    }
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
