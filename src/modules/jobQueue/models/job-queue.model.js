const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const JobQueue = sequelize.define('JobQueue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payloadJson: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  runAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'job_queue',
  timestamps: true
});

module.exports = JobQueue;
