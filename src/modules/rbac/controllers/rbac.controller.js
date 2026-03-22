const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const RolePermission = require('../models/role-permission.model');
const UserRole = require('../models/user-role.model');
const { seedDefaults, getUserPermissionKeys } = require('../services/rbac.service');

exports.seed = async (req, res) => {
  try {
    const result = await seedDefaults();
    return res.json({ success: true, seeded: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listRoles = async (req, res) => {
  try {
    const rows = await Role.findAll({ order: [['name', 'ASC']] });
    return res.json({ success: true, roles: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listPermissions = async (req, res) => {
  try {
    const rows = await Permission.findAll({ order: [['name', 'ASC']] });
    return res.json({ success: true, permissions: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body || {};
    if (!userId || !roleId) {
      return res.status(400).json({ success: false, message: 'userId and roleId are required' });
    }

    const existing = await UserRole.findOne({ where: { userId: String(userId), roleId: String(roleId) } });
    if (!existing) {
      await UserRole.create({ userId: String(userId), roleId: String(roleId) });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.attachPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body || {};
    if (!roleId || !permissionId) {
      return res.status(400).json({ success: false, message: 'roleId and permissionId are required' });
    }

    const existing = await RolePermission.findOne({ where: { roleId: String(roleId), permissionId: String(permissionId) } });
    if (!existing) {
      await RolePermission.create({ roleId: String(roleId), permissionId: String(permissionId) });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.myPermissions = async (req, res) => {
  try {
    const userId = req.user?.id || req.auth?.id || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not resolved' });
    }

    const permissions = await getUserPermissionKeys(userId);
    return res.json({ success: true, permissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
