const Permission = require('../../permissions/models/permission.model');

const DEFAULT_MODULES = [
  'collections',
  'fields',
  'records',
  'files',
  'api_keys',
  'settings',
  'audit_logs',
  'backups',
  'relational',
  'relationships',
  'webhooks',
  'functions',
  'users'
];

const DEFAULT_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'restore',
  'hard_delete'
];

exports.getMatrix = async (req, res) => {
  try {
    const role = req.query.role || 'admin';
    const items = await Permission.findAll({ where: { role } });

    const matrix = {};
    for (const mod of DEFAULT_MODULES) {
      matrix[mod] = {};
      for (const action of DEFAULT_ACTIONS) {
        matrix[mod][action] = false;
      }
    }

    for (const item of items) {
      if (!matrix[item.module]) matrix[item.module] = {};
      matrix[item.module][item.action] = Boolean(item.allowed);
    }

    return res.json({
      role,
      modules: DEFAULT_MODULES,
      actions: DEFAULT_ACTIONS,
      matrix
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load permission matrix',
      error: error.message
    });
  }
};

exports.saveMatrix = async (req, res) => {
  try {
    const { role, matrix } = req.body || {};

    if (!role || !matrix || typeof matrix !== 'object') {
      return res.status(400).json({ message: 'role and matrix are required' });
    }

    for (const [moduleName, actions] of Object.entries(matrix)) {
      for (const [actionName, allowed] of Object.entries(actions || {})) {
        const [item] = await Permission.findOrCreate({
          where: {
            role,
            module: moduleName,
            action: actionName
          },
          defaults: {
            allowed: Boolean(allowed)
          }
        });

        item.allowed = Boolean(allowed);
        await item.save();
      }
    }

    return res.json({ message: 'Permission matrix saved successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to save permission matrix',
      error: error.message
    });
  }
};
