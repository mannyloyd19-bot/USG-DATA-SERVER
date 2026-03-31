const User = require('../../users/models/user.model');

const ROLE_PERMISSION_MAP = {
  super_admin: ['*'],
  admin: [
    'users.read','users.write',
    'collections.read','collections.write',
    'records.read','records.write',
    'files.read','files.write',
    'webhooks.read','webhooks.write',
    'billing.read','billing.write',
    'settings.read','settings.write'
  ],
  viewer: [
    'users.read',
    'collections.read',
    'records.read',
    'files.read'
  ]
};

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

exports.summary = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    const roles = Object.keys(ROLE_PERMISSION_MAP).map(role => ({
      role,
      permissions: ROLE_PERMISSION_MAP[role]
    }));

    const mappedUsers = users.map(user => {
      const role = normalizeRole(user.role);
      return {
        id: user.id,
        username: user.username,
        role,
        permissions: ROLE_PERMISSION_MAP[role] || []
      };
    });

    return res.json({
      success: true,
      message: 'Permission matrix summary',
      data: {
        roles,
        users: mappedUsers
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.roles = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: 'Role permission map',
      data: ROLE_PERMISSION_MAP
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const nextRole = normalizeRole(req.body?.role);

    if (!nextRole) {
      return res.status(400).json({
        success: false,
        message: 'role is required'
      });
    }

    if (!ROLE_PERMISSION_MAP[nextRole]) {
      return res.status(400).json({
        success: false,
        message: 'invalid role'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = nextRole;
    await user.save();

    return res.json({
      success: true,
      message: 'User role updated',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: ROLE_PERMISSION_MAP[nextRole]
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
