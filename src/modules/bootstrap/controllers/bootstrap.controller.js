const bcrypt = require('bcrypt');
const User = require('../../users/models/user.model');

function validateMasterKey(req) {
  const providedKey = req.headers['x-master-key'] || req.body.masterKey;
  const systemKey = process.env.MASTER_SETUP_KEY;

  if (!systemKey) {
    return { ok: false, status: 500, message: 'MASTER_SETUP_KEY is not configured' };
  }

  if (!providedKey || providedKey !== systemKey) {
    return { ok: false, status: 403, message: 'Invalid master key' };
  }

  return { ok: true };
}

exports.createUserWithMasterKey = async (req, res) => {
  try {
    const keyCheck = validateMasterKey(req);
    if (!keyCheck.ok) {
      return res.status(keyCheck.status).json({ message: keyCheck.message });
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
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create user',
      error: error.message
    });
  }
};

exports.resetPasswordWithMasterKey = async (req, res) => {
  try {
    const keyCheck = validateMasterKey(req);
    if (!keyCheck.ok) {
      return res.status(keyCheck.status).json({ message: keyCheck.message });
    }

    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      return res.status(400).json({ message: 'username and newPassword are required' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      message: 'Password reset successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to reset password',
      error: error.message
    });
  }
};
