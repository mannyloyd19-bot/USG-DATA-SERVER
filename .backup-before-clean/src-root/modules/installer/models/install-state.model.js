const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const InstallState = sequelize.define('InstallState', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  isInstalled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  appName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  adminUsername: {
    type: DataTypes.STRING,
    allowNull: true
  },
  installedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = InstallState;
