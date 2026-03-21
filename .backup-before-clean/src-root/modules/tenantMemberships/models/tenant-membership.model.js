const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const TenantMembership = sequelize.define('TenantMembership', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'member'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'tenant_memberships',
  timestamps: true
});

module.exports = TenantMembership;
