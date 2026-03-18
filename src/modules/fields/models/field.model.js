const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');
const Collection = require('../../collections/models/collection.model');

const Field = sequelize.define('Field', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  collectionId: {
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
  searchable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  defaultValue: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  rules: {
    type: DataTypes.JSON,
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
      fields: ['collectionId', 'key']
    }
  ]
});

Collection.hasMany(Field, { foreignKey: 'collectionId', as: 'fields' });
Field.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });

module.exports = Field;
