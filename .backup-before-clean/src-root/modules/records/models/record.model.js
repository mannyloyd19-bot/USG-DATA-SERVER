const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database');
const Collection = require('../../collections/models/collection.model');

const Record = sequelize.define('Record', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  collectionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['collectionId'] },
    { fields: ['isDeleted'] }
  ]
});

Collection.hasMany(Record, { foreignKey: 'collectionId', as: 'records' });
Record.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });

const recordRealtimeHooks = require('../hooks/record.realtime');

Record.addHook('afterCreate', recordRealtimeHooks.afterCreate);
Record.addHook('afterUpdate', recordRealtimeHooks.afterUpdate);
Record.addHook('afterDestroy', recordRealtimeHooks.afterDelete);
module.exports = Record;
