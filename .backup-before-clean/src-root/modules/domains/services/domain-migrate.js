const { Sequelize } = require('sequelize');
const sequelize = require('../../../core/database');

async function addColumnIfMissing(tableName, columnName, sqlType) {
  const [rows] = await sequelize.query(`PRAGMA table_info(${tableName})`);
  const exists = (rows || []).some((r) => r.name === columnName);
  if (!exists) {
    await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${sqlType}`);
    console.log(`[domains] added column ${columnName}`);
  }
}

async function ensureDomainsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS domains (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await addColumnIfMissing('domains', 'serviceName', 'TEXT');
  await addColumnIfMissing('domains', 'routePath', "TEXT DEFAULT '/'");
  await addColumnIfMissing('domains', 'accessMode', "TEXT DEFAULT 'internal'");
  await addColumnIfMissing('domains', 'environment', "TEXT DEFAULT 'production'");
  await addColumnIfMissing('domains', 'domainKey', 'TEXT');
  await addColumnIfMissing('domains', 'publicAddress', 'TEXT');
  await addColumnIfMissing('domains', 'routingMode', "TEXT DEFAULT 'path'");
  await addColumnIfMissing('domains', 'status', "TEXT DEFAULT 'active'");
  await addColumnIfMissing('domains', 'sslStatus', "TEXT DEFAULT 'pending'");
  await addColumnIfMissing('domains', 'notes', 'TEXT');
}

module.exports = { ensureDomainsTable };
