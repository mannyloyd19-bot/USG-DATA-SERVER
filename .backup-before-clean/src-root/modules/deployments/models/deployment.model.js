const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const Deployment = sequelize.define('Deployment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  appPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  buildCommand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startCommand: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'npm run dev'
  },
  pm2Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'idle'
  },
  lastOutput: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'deployments',
  timestamps: true
});

module.exports = Deployment;
