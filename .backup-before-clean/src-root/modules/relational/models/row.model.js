const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');
const RelTable = require('./table.model');

const RelRow = sequelize.define('RelRow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tableId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    { fields: ['tableId'] },
    { fields: ['isDeleted'] }
  ]
});

RelTable.hasMany(RelRow, { foreignKey: 'tableId', as: 'rows' });
RelRow.belongsTo(RelTable, { foreignKey: 'tableId', as: 'table' });

module.exports = RelRow;
