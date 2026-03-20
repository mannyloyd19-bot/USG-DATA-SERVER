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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'domains',
  timestamps: true
});

module.exports = Domain;
