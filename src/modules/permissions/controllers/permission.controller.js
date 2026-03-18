const Permission = require('../models/permission.model');
const auditService = require('../../audit/services/audit.service');

exports.createOrUpdate = async (req, res) => {
  try {
    const { role, module, action, allowed } = req.body;

    if (!role || !module || !action) {
      return res.status(400).json({
        message: 'role, module, and action are required'
      });
    }

    const [permission, created] = await Permission.findOrCreate({
      where: { role, module, action },
      defaults: {
        allowed: allowed !== undefined ? Boolean(allowed) : true
      }
    });

    const beforeData = created ? null : permission.toJSON();

    if (!created && allowed !== undefined) {
      permission.allowed = Boolean(allowed);
      await permission.save();
    }

    await auditService.writeLog({
      req,
      user: req.user,
      module: 'permissions',
      action: created ? 'create' : 'update',
      entityType: 'Permission',
      entityId: permission.id,
      status: 'success',
      message: created
        ? 'Permission created successfully'
        : 'Permission updated successfully',
      beforeData,
      afterData: permission.toJSON(),
      metadata: { role, module, action }
    });

    return res.status(created ? 201 : 200).json(permission);
  } catch (error) {
    await auditService.writeLog({
      req,
      user: req.user,
      module: 'permissions',
      action: 'create_or_update',
      entityType: 'Permission',
      status: 'failed',
      message: error.message,
      metadata: req.body || null
    });

    return res.status(500).json({
      message: 'Failed to save permission',
      error: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.module) where.module = req.query.module;
    if (req.query.action) where.action = req.query.action;

    const permissions = await Permission.findAll({
      where,
      order: [['role', 'ASC'], ['module', 'ASC'], ['action', 'ASC']]
    });

    return res.json(permissions);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch permissions',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.permissionId);

    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    const beforeData = permission.toJSON();
    await permission.destroy();

    await auditService.writeLog({
      req,
      user: req.user,
      module: 'permissions',
      action: 'delete',
      entityType: 'Permission',
      entityId: req.params.permissionId,
      status: 'success',
      message: 'Permission deleted successfully',
      beforeData
    });

    return res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    await auditService.writeLog({
      req,
      user: req.user,
      module: 'permissions',
      action: 'delete',
      entityType: 'Permission',
      entityId: req.params.permissionId,
      status: 'failed',
      message: error.message
    });

    return res.status(500).json({
      message: 'Failed to delete permission',
      error: error.message
    });
  }
};
