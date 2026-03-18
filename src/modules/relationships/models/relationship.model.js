const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const Relationship = sequelize.define('Relationship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sourceTableKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sourceColumnKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetTableKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetColumnKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relationType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'one_to_many'
  },
  onDelete: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'restrict'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: [
        'sourceTableKey',
        'sourceColumnKey',
        'targetTableKey',
        'targetColumnKey'
      ]
    }
  ]
});

module.exports = Relationship;
