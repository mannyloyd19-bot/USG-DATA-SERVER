const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const StorageBucket = sequelize.define('StorageBucket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  visibility: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'private'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'storage_buckets',
  timestamps: true
});

module.exports = StorageBucket;
