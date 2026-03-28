const sequelize = require('../core/database');
const Collection = require('../modules/collections/models/collection.model');
const FileEntry = require('../modules/files/models/file.model');

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

async function repairFilesTable() {
  const tableName = FileEntry.getTableName();

  await addColumnIfMissing(tableName, 'isArchived', {
    type: sequelize.Sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  });

  await addColumnIfMissing(tableName, 'metadata', {
    type: sequelize.Sequelize.DataTypes.JSON,
    allowNull: true
  });

  await addColumnIfMissing(tableName, 'bucketId', {
    type: sequelize.Sequelize.DataTypes.STRING,
    allowNull: true
  });

  await addColumnIfMissing(tableName, 'visibility', {
    type: sequelize.Sequelize.DataTypes.STRING,
    allowNull: false,
    defaultValue: 'private'
  });
}

async function repairSchema() {
  try {
    await repairCollectionsTable();
    await repairFilesTable();
    console.log('[Schema Repair] Completed');
  } catch (error) {
    console.error('[Schema Repair] Failed:', error.message);
    throw error;
  }
}

module.exports = {
  repairSchema
};
