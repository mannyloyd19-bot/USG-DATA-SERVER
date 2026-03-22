const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  roleId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  permissionId: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'rbac_role_permissions',
  timestamps: true
});

module.exports = RolePermission;
