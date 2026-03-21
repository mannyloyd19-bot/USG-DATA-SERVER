const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const DbMigrationState = sequelize.define('DbMigrationState', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sourceDialect: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'sqlite'
  },
  targetDialect: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetHost: {
    type: DataTypes.STRING,
    allowNull: true
  },
  targetPort: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  targetDatabase: {
    type: DataTypes.STRING,
    allowNull: true
  },
  targetUsername: {
    type: DataTypes.STRING,
    allowNull: true
  },
  targetPassword: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'draft'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastDryRunAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'db_migration_states',
  timestamps: true
});

module.exports = DbMigrationState;
