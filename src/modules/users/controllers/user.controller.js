const validation = require('../../../core/utils/validation');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    const errors = validation.collect(
      validation.required(payload.username, 'Username'),
      validation.minLength(payload.username, 'Username', 3),
      validation.required(payload.role, 'Role'),
      validation.email(payload.email, 'Email')
    );
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || 'admin'
    });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create user',
      error: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, password, role } = req.body;

    if (username !== undefined) user.username = username;
    if (role !== undefined) user.role = role;

    if (password !== undefined && password !== '') {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update user',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    });
  }
};
