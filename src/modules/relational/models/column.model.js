const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');
const RelTable = require('./table.model');

const RelColumn = sequelize.define('RelColumn', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tableId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'TEXT'
  },
  required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  uniqueValue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  defaultValue: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['tableId', 'key']
    }
  ]
});

RelTable.hasMany(RelColumn, { foreignKey: 'tableId', as: 'columns' });
RelColumn.belongsTo(RelTable, { foreignKey: 'tableId', as: 'table' });

module.exports = RelColumn;
