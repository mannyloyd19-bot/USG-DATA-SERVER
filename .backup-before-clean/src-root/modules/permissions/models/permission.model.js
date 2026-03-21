const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  allowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['role', 'module', 'action']
    }
  ]
});

module.exports = Permission;
