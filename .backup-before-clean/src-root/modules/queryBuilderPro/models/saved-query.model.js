const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const SavedQuery = sequelize.define('SavedQuery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  collectionKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  queryJson: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'saved_queries',
  timestamps: true
});

module.exports = SavedQuery;
