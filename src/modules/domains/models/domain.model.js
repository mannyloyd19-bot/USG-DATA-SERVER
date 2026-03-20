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
  route: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '/'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'internal'
  },
  domainKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publicUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
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
