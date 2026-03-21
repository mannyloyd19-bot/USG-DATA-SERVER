const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const BackupJob = sequelize.define('BackupJob', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sizeBytes: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'completed'
  },
  triggerType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'manual'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'backup_jobs',
  timestamps: true
});

module.exports = BackupJob;
