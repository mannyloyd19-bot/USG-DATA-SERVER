const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roleId: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'rbac_user_roles',
  timestamps: true
});

module.exports = UserRole;
