const { Sequelize } = require('sequelize');

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

exports.testConnection = async (config) => {
  const sequelize = buildTargetSequelize(config);
  try {
    await sequelize.authenticate();
    return { success: true, message: 'Connection successful' };
  } finally {
    await sequelize.close().catch(() => {});
  }
};

exports.buildDryRunPlan = async (config) => {
  const targetDialect = String(config.targetDialect || '').toLowerCase();
  const supported = ['mysql', 'postgres', 'postgresql'];

  if (!supported.includes(targetDialect)) {
    throw new Error('Dry run supports mysql or postgres targets only');
  }

  const plan = {
    sourceDialect: config.sourceDialect || 'sqlite',
    targetDialect,
    steps: [
      'Validate source database accessibility',
      'Validate target database connection',
      'Create backup before migration',
      'Create target schema using Sequelize models',
      'Copy core tables and records',
      'Verify row counts and integrity',
      'Switch environment config to target DB',
      'Restart application and run final health check'
    ],
    warnings: [
      'Automatic live data copy is not included in this batch',
      'Take a full backup before actual migration',
      'Run migration first on staging or test machine',
      'Verify files/uploads path separately from database migration'
    ]
  };

  return plan;
};
