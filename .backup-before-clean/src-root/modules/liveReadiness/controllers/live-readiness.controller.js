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

exports.status = async (req, res) => {
  try {
    const dbPath = process.env.DB_STORAGE || './database.sqlite';
    const uploadPath = path.join(process.cwd(), 'storage', 'uploads');
    const backupPath = path.join(process.cwd(), 'storage', 'backups');

    const checks = {
      serverRunning: true,
      dbConfigured: !!dbPath,
      dbFileExists: exists(dbPath),
      uploadsDirExists: exists(uploadPath),
      backupsDirExists: exists(backupPath),
      duckdnsConfigured: !!process.env.DUCKDNS_DOMAIN && !!process.env.DUCKDNS_TOKEN,
      jwtConfigured: !!process.env.JWT_SECRET,
      publicGatewayReady: !!process.env.DUCKDNS_DOMAIN,
      pwaManifestExists: exists('public/manifest.json'),
      serviceWorkerExists: exists('public/sw.js')
    };

    const readinessPercent = Math.round(
      (Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100
    );

    return res.json({
      success: true,
      readinessPercent,
      checks,
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptimeSeconds: os.uptime(),
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
        dbPath
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
