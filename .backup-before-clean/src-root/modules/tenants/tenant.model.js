const { DataTypes } = require('sequelize');
const sequelize = require('../../core/database');

const Tenant = sequelize.define('Tenant', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: DataTypes.STRING
});

module.exports = Tenant;
