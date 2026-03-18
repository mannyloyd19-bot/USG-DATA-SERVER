const bcrypt = require('bcrypt');
const User = require('../../users/models/user.model');

exports.createUserWithMasterKey = async (req, res) => {
  try {
    const providedKey = req.headers['x-master-key'] || req.body.masterKey;
    const systemKey = process.env.MASTER_SETUP_KEY;

    if (!systemKey) {
      return res.status(500).json({ message: 'MASTER_SETUP_KEY is not configured' });
    }

    if (!providedKey || providedKey !== systemKey) {
      return res.status(403).json({ message: 'Invalid master key' });
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
      role: role || 'super_admin'
    });

    return res.status(201).json({
      message: 'Bootstrap user created successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create bootstrap user',
      error: error.message
    });
  }
};
