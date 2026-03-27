const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const BackupConfig = sequelize.define('BackupConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  backupDir: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'storage/backups'
  },
  sourceDbPath: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'storage/database.sqlite'
  },
  autoEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  intervalMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60
  },
  retentionCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  }
}, {
  tableName: 'backup_configs',
  timestamps: true
});

module.exports = BackupConfig;
