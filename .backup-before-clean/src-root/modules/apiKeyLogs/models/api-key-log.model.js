const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const ApiKeyLog = sequelize.define('ApiKeyLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  apiKeyId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  apiKeyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = ApiKeyLog;
