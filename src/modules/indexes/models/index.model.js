const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const IndexModel = sequelize.define('IndexModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  collectionKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  indexName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fields: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]'
  },
  uniqueIndex: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'indexes_registry',
  timestamps: true
});

module.exports = IndexModel;
