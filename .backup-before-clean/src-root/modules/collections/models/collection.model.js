const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');

const Collection = sequelize.define('Collection', {
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
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  schemaMode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'strict'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const collectionRealtimeHooks = require('../hooks/collection.realtime');

Collection.addHook('afterCreate', collectionRealtimeHooks.afterCreate);
Collection.addHook('afterUpdate', collectionRealtimeHooks.afterUpdate);
Collection.addHook('afterDestroy', collectionRealtimeHooks.afterDelete);
module.exports = Collection;
