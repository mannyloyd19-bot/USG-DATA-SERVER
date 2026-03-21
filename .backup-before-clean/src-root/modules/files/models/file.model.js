const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const FileEntry = sequelize.define('FileEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  storedName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  storagePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  collectionKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recordId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['collectionKey'] },
    { fields: ['recordId'] },
    { fields: ['uploadedBy'] }
  ]
});

module.exports = FileEntry;
