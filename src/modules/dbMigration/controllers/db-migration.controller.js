const DbMigrationState = require('../models/db-migration-state.model');
const service = require('../services/db-migration.service');

exports.getLatest = async (req, res) => {
  try {
    const item = await DbMigrationState.findOne({
      order: [['createdAt', 'DESC']]
    });

    return res.json(item || null);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load migration state',
      error: error.message
    });
  }
};

exports.saveDraft = async (req, res) => {
  try {
    const payload = req.body || {};

    const item = await DbMigrationState.create({
      sourceDialect: payload.sourceDialect || process.env.DB_DIALECT || 'sqlite',
      targetDialect: payload.targetDialect,
      targetHost: payload.targetHost || null,
      targetPort: payload.targetPort ? Number(payload.targetPort) : null,
      targetDatabase: payload.targetDatabase || null,
      targetUsername: payload.targetUsername || null,
      targetPassword: payload.targetPassword || null,
      status: 'draft',
      notes: payload.notes || null
    });

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to save migration draft',
      error: error.message
    });
  }
};

exports.testConnection = async (req, res) => {
  try {
    const result = await service.testConnection(req.body || {});
    return res.json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Connection test failed',
      error: error.message
    });
  }
};

exports.dryRun = async (req, res) => {
  try {
    const plan = await service.buildDryRunPlan(req.body || {});

    const latest = await DbMigrationState.findOne({ order: [['createdAt', 'DESC']] });
    if (latest) {
      latest.status = 'dry_run_ready';
      latest.lastDryRunAt = new Date();
      await latest.save();
    }

    return res.json({
      success: true,
      plan
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Dry run failed',
      error: error.message
    });
  }
};

exports.runMigration = async (req, res) => {
  try {
    const result = await service.runMigration(req.body || {});

    const latest = await DbMigrationState.findOne({ order: [['createdAt', 'DESC']] });
    if (latest) {
      latest.status = result.success ? 'migrated' : 'migration_completed_with_errors';
      latest.notes = JSON.stringify({
        backupPath: result.backupPath,
        tableCount: result.tables.length,
        success: result.success
      });
      await latest.save();
    }

    return res.json({
      success: result.success,
      result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
};

exports.verifyMigration = async (req, res) => {
  try {
    const result = await service.verifyMigration(req.body || {});

    const latest = await DbMigrationState.findOne({ order: [['createdAt', 'DESC']] });
    if (latest) {
      latest.status = result.success ? 'verified' : 'verification_mismatch';
      await latest.save();
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};
