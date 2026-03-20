const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const App = sequelize.define('App', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entry: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'app.js'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'stopped'
  }
}, {
  tableName: 'apps',
  timestamps: true
});

module.exports = App;
