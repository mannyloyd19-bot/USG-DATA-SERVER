const fs = require('fs');
const path = require('path');

function exists(p) {
  try {
    return fs.existsSync(path.resolve(p));
  } catch {
    return false;
  }
}

exports.summary = async (req, res) => {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    let version = '1.0.0';
    let name = 'nexacore';

    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      version = pkg.version || version;
      name = pkg.name || name;
    }

    return res.json({
      success: true,
      app: {
        name,
        version,
        env: process.env.NODE_ENV || 'development',
        dbPath: process.env.DB_STORAGE || './database.sqlite',
        duckdnsDomain: process.env.DUCKDNS_DOMAIN || null
      },
      files: {
        manifest: exists('public/manifest.json'),
        serviceWorker: exists('public/sw.js'),
        offlinePage: exists('public/offline/index.html'),
        envFile: exists('.env')
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
