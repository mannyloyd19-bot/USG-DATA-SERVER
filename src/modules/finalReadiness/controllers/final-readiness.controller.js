const fs = require('fs');
const os = require('os');
const path = require('path');

function exists(p) {
  try {
    return fs.existsSync(path.resolve(p));
  } catch {
    return false;
  }
}

exports.bootStatus = async (req, res) => {
  try {
    const dbPath = process.env.DB_STORAGE || './database.sqlite';
    const checks = {
      envLoaded: true,
      jwtConfigured: !!process.env.JWT_SECRET,
      dbConfigured: !!dbPath,
      dbExists: exists(dbPath),
      uploadsDir: exists('storage/uploads'),
      backupsDir: exists('storage/backups'),
      manifestExists: exists('public/manifest.json'),
      serviceWorkerExists: exists('public/sw.js'),
      duckdnsConfigured: !!process.env.DUCKDNS_DOMAIN && !!process.env.DUCKDNS_TOKEN,
      portConfigured: !!process.env.PORT
    };

    const readinessPercent = Math.round(
      (Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100
    );

    return res.json({
      success: true,
      readinessPercent,
      checks,
      runtime: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptimeSeconds: os.uptime(),
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
        dbPath
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.lockStatus = async (req, res) => {
  try {
    return res.json({
      success: true,
      lock: {
        releaseLockdown: !!process.env.RELEASE_LOCKDOWN,
        installerEnabled: String(process.env.INSTALLER_ENABLED || 'true') !== 'false',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
