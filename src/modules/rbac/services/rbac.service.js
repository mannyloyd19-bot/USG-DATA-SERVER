const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const RolePermission = require('../models/role-permission.model');
const UserRole = require('../models/user-role.model');
const User = require('../../users/models/user.model');

function normalizeRoleKey(value) {
  return String(value || '').trim().toLowerCase();
}

function isFullAccessRole(roleKey) {
  return ['admin', 'super_admin', 'superadmin', 'owner'].includes(normalizeRoleKey(roleKey));
}

async function getUserRoles(userId) {
  const directAssignments = await UserRole.findAll({ where: { userId: String(userId) } });

  if (directAssignments.length) {
    const roleIds = directAssignments.map(r => r.roleId);
    return Role.findAll({ where: { id: roleIds } });
  }

  const user = await User.findByPk(userId);
  if (!user || !user.role) return [];

  const fallbackKey = normalizeRoleKey(user.role);
  let fallbackRole = await Role.findOne({ where: { key: fallbackKey } });

  if (!fallbackRole && isFullAccessRole(fallbackKey)) {
    fallbackRole = await Role.findOne({ where: { key: 'admin' } });
  }

  return fallbackRole ? [fallbackRole] : [];
}

async function getUserPermissionKeys(userId) {
  const roles = await getUserRoles(userId);
  if (!roles.length) {
    const user = await User.findByPk(userId);
    if (user && isFullAccessRole(user.role)) return ['*'];
    return [];
  }

  if (roles.some(r => isFullAccessRole(r.key))) {
    return ['*'];
  }

  const user = await User.findByPk(userId);
  if (user && isFullAccessRole(user.role)) {
    return ['*'];
  }

  const roleIds = roles.map(r => r.id);
  const rolePermissions = await RolePermission.findAll({ where: { roleId: roleIds } });
  if (!rolePermissions.length) return [];

  const permissionIds = rolePermissions.map(rp => rp.permissionId);
  const permissions = await Permission.findAll({ where: { id: permissionIds } });
  return permissions.map(p => p.key);
}

async function userHasPermission(userId, permissionKey) {
  const keys = await getUserPermissionKeys(userId);
  return keys.includes('*') || keys.includes(permissionKey);
}

async function seedDefaults() {
  const roleDefaults = [
    { key: 'admin', name: 'Admin', description: 'Full platform access' },
    { key: 'editor', name: 'Editor', description: 'Create and update access' },
    { key: 'viewer', name: 'Viewer', description: 'Read-only access' }
  ];

  const permissionDefaults = [
    { key: 'users.read', name: 'Read Users' },
    { key: 'users.write', name: 'Write Users' },
    { key: 'collections.read', name: 'Read Collections' },
    { key: 'collections.write', name: 'Write Collections' },
    { key: 'files.read', name: 'Read Files' },
    { key: 'files.write', name: 'Write Files' },
    { key: 'domains.read', name: 'Read Domains' },
    { key: 'domains.write', name: 'Write Domains' },
    { key: 'settings.read', name: 'Read Settings' },
    { key: 'settings.write', name: 'Write Settings' },
    { key: 'audit.read', name: 'Read Audit Logs' }
  ];

  for (const item of roleDefaults) {
    const existing = await Role.findOne({ where: { key: item.key } });
    if (!existing) await Role.create(item);
  }

  for (const item of permissionDefaults) {
    const existing = await Permission.findOne({ where: { key: item.key } });
    if (!existing) await Permission.create(item);
  }

  const roles = await Role.findAll();
  const permissions = await Permission.findAll();

  const roleMap = Object.fromEntries(roles.map(r => [r.key, r]));
  const permissionMap = Object.fromEntries(permissions.map(p => [p.key, p]));

  const pairs = [
    ['admin', 'users.read'], ['admin', 'users.write'],
    ['admin', 'collections.read'], ['admin', 'collections.write'],
    ['admin', 'files.read'], ['admin', 'files.write'],
    ['admin', 'domains.read'], ['admin', 'domains.write'],
    ['admin', 'settings.read'], ['admin', 'settings.write'],
    ['admin', 'audit.read'],

    ['editor', 'users.read'],
    ['editor', 'collections.read'], ['editor', 'collections.write'],
    ['editor', 'files.read'], ['editor', 'files.write'],
    ['editor', 'domains.read'], ['editor', 'domains.write'],

    ['viewer', 'users.read'],
    ['viewer', 'collections.read'],
    ['viewer', 'files.read'],
    ['viewer', 'domains.read'],
    ['viewer', 'settings.read'],
    ['viewer', 'audit.read']
  ];

  for (const [roleKey, permKey] of pairs) {
    const role = roleMap[roleKey];
    const perm = permissionMap[permKey];
    if (!role || !perm) continue;

    const existing = await RolePermission.findOne({
      where: { roleId: role.id, permissionId: perm.id }
    });

    if (!existing) {
      await RolePermission.create({ roleId: role.id, permissionId: perm.id });
    }
  }

  return { roles, permissions };
}

module.exports = {
  getUserRoles,
  getUserPermissionKeys,
  userHasPermission,
  seedDefaults
};
