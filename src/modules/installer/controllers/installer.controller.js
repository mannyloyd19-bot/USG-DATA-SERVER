const bcrypt = require('bcrypt');
const InstallState = require('../models/install-state.model');
const User = require('../../users/models/user.model');
const Setting = require('../../settings/models/setting.model');

async function getSingleton() {
  let state = await InstallState.findOne();
  if (!state) {
    state = await InstallState.create({});
  }
  return state;
}

exports.status = async (req, res) => {
  try {
    const state = await getSingleton();

    return res.json({
      success: true,
      data: {
        isInstalled: state.isInstalled,
        appName: state.appName,
        companyName: state.companyName,
        adminUsername: state.adminUsername,
        installedAt: state.installedAt,
        nodeEnv: process.env.NODE_ENV || 'development',
        dbDialect: process.env.DB_DIALECT || 'sqlite',
        jwtConfigured: Boolean(process.env.JWT_SECRET),
        masterSetupConfigured: Boolean(process.env.MASTER_SETUP_KEY)
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load install status',
      error: error.message
    });
  }
};

exports.systemCheck = async (req, res) => {
  try {
    const checks = [
      {
        key: 'jwt_secret',
        label: 'JWT Secret',
        ok: Boolean(process.env.JWT_SECRET)
      },
      {
        key: 'db_dialect',
        label: 'Database Dialect',
        ok: Boolean(process.env.DB_DIALECT || 'sqlite')
      },
      {
        key: 'master_setup_key',
        label: 'Master Setup Key',
        ok: Boolean(process.env.MASTER_SETUP_KEY)
      },
      {
        key: 'node_env',
        label: 'Node Environment',
        ok: Boolean(process.env.NODE_ENV || 'development')
      }
    ];

    return res.json({
      success: true,
      checks
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to run system check',
      error: error.message
    });
  }
};

exports.install = async (req, res) => {
  try {
    const state = await getSingleton();

    if (state.isInstalled) {
      return res.status(409).json({ message: 'System is already installed' });
    }

    const {
      appName,
      companyName,
      adminUsername,
      adminPassword
    } = req.body || {};

    if (!appName || !companyName || !adminUsername || !adminPassword) {
      return res.status(400).json({
        message: 'appName, companyName, adminUsername, and adminPassword are required'
      });
    }

    const existingUser = await User.findOne({ where: { username: adminUsername } });
    if (existingUser) {
      return res.status(409).json({ message: 'Admin username already exists' });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      username: adminUsername,
      password: hashedPassword,
      role: 'super_admin'
    });

    const upserts = [
      {
        key: 'app.name',
        value: appName,
        group: 'general',
        label: 'Application Name',
        description: 'Primary system name'
      },
      {
        key: 'app.company',
        value: companyName,
        group: 'general',
        label: 'Company Name',
        description: 'Company or organization name'
      }
    ];

    for (const item of upserts) {
      const [setting] = await Setting.findOrCreate({
        where: { key: item.key },
        defaults: item
      });
      setting.value = item.value;
      await setting.save();
    }

    state.isInstalled = true;
    state.appName = appName;
    state.companyName = companyName;
    state.adminUsername = adminUsername;
    state.installedAt = new Date();
    await state.save();

    return res.json({
      success: true,
      message: 'Installation completed successfully',
      data: {
        appName,
        companyName,
        adminUsername
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Installation failed',
      error: error.message
    });
  }
};
