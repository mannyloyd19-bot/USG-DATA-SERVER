const sequelize = require('../core/database');
const Collection = require('../modules/collections/models/collection.model');

async function columnExists(tableName, columnName) {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(table, columnName);
}

async function addColumnIfMissing(tableName, columnName, definition) {
  const exists = await columnExists(tableName, columnName);
  if (exists) return false;

  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.addColumn(tableName, columnName, definition);
  console.log(`[Schema Repair] Added ${tableName}.${columnName}`);
  return true;
}

async function repairCollectionsTable() {
  const tableName = Collection.getTableName();

  await addColumnIfMissing(tableName, 'schemaMode', {
    type: sequelize.Sequelize.DataTypes.STRING,
    allowNull: false,
    defaultValue: 'strict'
  });

  await addColumnIfMissing(tableName, 'isActive', {
    type: sequelize.Sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  });
}

async function repairSchema() {
  try {
    await repairCollectionsTable();
    console.log('[Schema Repair] Completed');
  } catch (error) {
    console.error('[Schema Repair] Failed:', error.message);
    throw error;
  }
}

module.exports = {
  repairSchema
};
