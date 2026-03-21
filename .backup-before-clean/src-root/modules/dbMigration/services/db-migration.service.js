const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const sourceSequelize = require('../../../core/database');

function buildTargetSequelize(config) {
  const dialect = String(config.targetDialect || '').toLowerCase();

  if (dialect === 'mysql') {
    return new Sequelize(
      config.targetDatabase,
      config.targetUsername,
      config.targetPassword,
      {
        host: config.targetHost || '127.0.0.1',
        port: Number(config.targetPort || 3306),
        dialect: 'mysql',
        logging: false
      }
    );
  }

  if (dialect === 'postgres' || dialect === 'postgresql') {
    return new Sequelize(
      config.targetDatabase,
      config.targetUsername,
      config.targetPassword,
      {
        host: config.targetHost || '127.0.0.1',
        port: Number(config.targetPort || 5432),
        dialect: 'postgres',
        logging: false
      }
    );
  }

  throw new Error('Unsupported target dialect');
}

function cloneAttributes(rawAttributes) {
  const out = {};

  for (const [name, attr] of Object.entries(rawAttributes || {})) {
    const next = {};

    if (attr.type) next.type = attr.type;
    if (attr.allowNull !== undefined) next.allowNull = attr.allowNull;
    if (attr.primaryKey !== undefined) next.primaryKey = attr.primaryKey;
    if (attr.autoIncrement !== undefined) next.autoIncrement = attr.autoIncrement;
    if (attr.defaultValue !== undefined) next.defaultValue = attr.defaultValue;
    if (attr.unique !== undefined) next.unique = attr.unique;
    if (attr.field) next.field = attr.field;
    if (attr.comment) next.comment = attr.comment;
    if (attr.values) next.values = attr.values;
    if (attr.onUpdate) next.onUpdate = attr.onUpdate;
    if (attr.onDelete) next.onDelete = attr.onDelete;

    if (attr.references) {
      let refModel = attr.references.model;
      if (refModel && typeof refModel.getTableName === 'function') {
        refModel = refModel.getTableName();
      }
      next.references = {
        model: refModel,
        key: attr.references.key
      };
    }

    out[name] = next;
  }

  return out;
}

function cloneModelOptions(model) {
  return {
    tableName: model.getTableName(),
    timestamps: model.options.timestamps,
    paranoid: model.options.paranoid,
    underscored: model.options.underscored,
    freezeTableName: model.options.freezeTableName
  };
}

function getMigratableModels() {
  const models = Object.values(sourceSequelize.models || {});
  const exclude = new Set([
    'DbMigrationState'
  ]);

  return models.filter(model => !exclude.has(model.name));
}

async function testConnection(config) {
  const sequelize = buildTargetSequelize(config);
  try {
    await sequelize.authenticate();
    return { success: true, message: 'Connection successful' };
  } finally {
    await sequelize.close().catch(() => {});
  }
}

async function buildDryRunPlan(config) {
  const targetDialect = String(config.targetDialect || '').toLowerCase();
  const supported = ['mysql', 'postgres', 'postgresql'];

  if (!supported.includes(targetDialect)) {
    throw new Error('Dry run supports mysql or postgres targets only');
  }

  const models = getMigratableModels();

  return {
    sourceDialect: config.sourceDialect || process.env.DB_DIALECT || 'sqlite',
    targetDialect,
    modelCount: models.length,
    tables: models.map(m => ({
      model: m.name,
      table: m.getTableName()
    })),
    steps: [
      'Validate source database accessibility',
      'Validate target database connection',
      'Create backup before migration',
      'Clone target schema using Sequelize models',
      'Copy records table by table',
      'Verify row counts and summarize results',
      'Switch environment config to target DB manually after review'
    ],
    warnings: [
      'Automatic environment switch is not included in this batch',
      'Run first on staging or test target database',
      'Target database should be empty or prepared to avoid PK conflicts',
      'Verify uploads/files storage separately from database migration'
    ]
  };
}

async function disableForeignKeys(sequelize) {
  const dialect = sequelize.getDialect();

  if (dialect === 'mysql') {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  } else if (dialect === 'postgres') {
    await sequelize.query("SET session_replication_role = 'replica'");
  } else if (dialect === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = OFF');
  }
}

async function enableForeignKeys(sequelize) {
  const dialect = sequelize.getDialect();

  if (dialect === 'mysql') {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  } else if (dialect === 'postgres') {
    await sequelize.query("SET session_replication_role = 'origin'");
  } else if (dialect === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = ON');
  }
}

function maybeBackupSource() {
  const dialect = String(process.env.DB_DIALECT || 'sqlite').toLowerCase();
  if (dialect !== 'sqlite') return null;

  const storage = process.env.DB_STORAGE || './database.sqlite';
  const sourcePath = path.resolve(storage);
  if (!fs.existsSync(sourcePath)) return null;

  const backupsDir = path.resolve('backups');
  fs.mkdirSync(backupsDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetPath = path.join(backupsDir, `pre-migration-${stamp}.sqlite`);

  fs.copyFileSync(sourcePath, targetPath);
  return targetPath;
}

async function buildTargetModels(targetSequelize) {
  const sourceModels = getMigratableModels();
  const targetModels = {};

  for (const model of sourceModels) {
    const attrs = cloneAttributes(model.rawAttributes);
    const options = cloneModelOptions(model);
    targetModels[model.name] = targetSequelize.define(model.name, attrs, options);
  }

  await targetSequelize.sync();
  return { sourceModels, targetModels };
}

async function runMigration(config) {
  const targetSequelize = buildTargetSequelize(config);

  const summary = {
    backupPath: null,
    sourceDialect: sourceSequelize.getDialect(),
    targetDialect: targetSequelize.getDialect(),
    tables: [],
    success: false
  };

  try {
    await sourceSequelize.authenticate();
    await targetSequelize.authenticate();

    summary.backupPath = maybeBackupSource();

    const { sourceModels, targetModels } = await buildTargetModels(targetSequelize);

    await disableForeignKeys(targetSequelize);

    for (const sourceModel of sourceModels) {
      const targetModel = targetModels[sourceModel.name];
      const rows = await sourceModel.findAll({ raw: true });

      let inserted = 0;
      let skipped = 0;
      let errorMessage = null;

      try {
        if (rows.length > 0) {
          await targetModel.bulkCreate(rows, {
            validate: false,
            hooks: false
          });
          inserted = rows.length;
        }
      } catch (error) {
        errorMessage = error.message;
        skipped = rows.length;
      }

      summary.tables.push({
        model: sourceModel.name,
        table: sourceModel.getTableName(),
        sourceRows: rows.length,
        inserted,
        skipped,
        error: errorMessage
      });
    }

    await enableForeignKeys(targetSequelize);

    summary.success = summary.tables.every(t => !t.error);
    return summary;
  } finally {
    await enableForeignKeys(targetSequelize).catch(() => {});
    await targetSequelize.close().catch(() => {});
  }
}

async function verifyMigration(config) {
  const targetSequelize = buildTargetSequelize(config);

  try {
    await sourceSequelize.authenticate();
    await targetSequelize.authenticate();

    const { sourceModels, targetModels } = await buildTargetModels(targetSequelize);

    const tables = [];
    for (const sourceModel of sourceModels) {
      const targetModel = targetModels[sourceModel.name];

      let sourceCount = 0;
      let targetCount = 0;
      let error = null;

      try {
        sourceCount = await sourceModel.count();
        targetCount = await targetModel.count();
      } catch (err) {
        error = err.message;
      }

      tables.push({
        model: sourceModel.name,
        table: sourceModel.getTableName(),
        sourceCount,
        targetCount,
        matched: !error && sourceCount === targetCount,
        error
      });
    }

    const matchedTables = tables.filter(t => t.matched).length;
    const mismatchedTables = tables.filter(t => !t.matched).length;

    return {
      success: mismatchedTables === 0,
      summary: {
        totalTables: tables.length,
        matchedTables,
        mismatchedTables
      },
      tables
    };
  } finally {
    await targetSequelize.close().catch(() => {});
  }
}

module.exports = {
  testConnection,
  buildDryRunPlan,
  runMigration,
  verifyMigration
};
