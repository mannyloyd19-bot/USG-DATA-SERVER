const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const WebhookDelivery = sequelize.define('WebhookDelivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  webhookId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetUrl: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requestBody: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responseStatus: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  responseBody: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  retryCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'webhook_deliveries',
  timestamps: true
});

module.exports = WebhookDelivery;
