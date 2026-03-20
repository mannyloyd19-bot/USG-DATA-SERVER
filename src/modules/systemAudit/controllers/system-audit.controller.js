const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function exists(p) {
  try {
    return fs.existsSync(path.resolve(p));
  } catch {
    return false;
  }
}

function run(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 15000, maxBuffer: 1024 * 1024 * 4 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout ? stdout.trim() : '',
        stderr: stderr ? stderr.trim() : '',
        error: error ? error.message : null
      });
    });
  });
}

async function getCoreTables() {
  const dbPath = process.env.DB_STORAGE || './database.sqlite';
  if (!exists(dbPath)) {
    return {
      databaseFound: false,
      dbPath,
      tables: []
    };
  }

  const sqliteCmd = `node -e "const sqlite3=require('sqlite3').verbose(); const db=new sqlite3.Database('${dbPath}'); db.all(\\"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name\\", (err, rows)=>{ if(err){ console.error(err.message); process.exit(1);} console.log(JSON.stringify(rows||[])); db.close(); });"`;
  const result = await run(sqliteCmd);

  let tables = [];
  try {
    tables = JSON.parse(result.stdout || '[]').map(x => x.name);
  } catch {}

  return {
    databaseFound: true,
    dbPath,
    tables
  };
}

exports.report = async (req, res) => {
  try {
    const criticalFiles = [
      'src/server.js',
      'src/app.js',
      'public/js/app-shell.js',
      'public/css/app-shell.css',
      'src/modules/domains/models/domain.model.js',
      'src/modules/infrastructure/models/infrastructure-config.model.js',
      'src/modules/network/models/network-config.model.js',
      'src/modules/apps/models/app.model.js',
      'src/modules/deployments/models/deployment.model.js',
      'src/modules/docker/models/docker-config.model.js',
      'src/modules/ddns/controllers/ddns.controller.js',
      'src/modules/runtime/controllers/runtime.controller.js'
    ];

    const criticalPages = [
      'public/pages/domains.html',
      'public/pages/infrastructure.html',
      'public/pages/network-center.html',
      'public/pages/apps.html',
      'public/pages/deployments.html',
      'public/pages/docker-center.html'
    ];

    const fileChecks = criticalFiles.map(file => ({
      file,
      exists: exists(file)
    }));

    const pageChecks = criticalPages.map(file => ({
      file,
      exists: exists(file)
    }));

    const db = await getCoreTables();

    const expectedTables = [
      'domains',
      'infrastructure_configs',
      'network_configs',
      'apps',
      'deployments',
      'docker_configs',
      'tenants',
      'tenant_memberships',
      'Settings',
      'api_keys'
    ];

    const dbChecks = expectedTables.map(name => ({
      table: name,
      exists: (db.tables || []).includes(name)
    }));

    const pm2 = await run('pm2 list');
    const git = await run('git status --short');
    const duck = {
      domainConfigured: !!process.env.DUCKDNS_DOMAIN,
      tokenConfigured: !!process.env.DUCKDNS_TOKEN
    };

    const buckets = [
      ...fileChecks.map(x => x.exists),
      ...pageChecks.map(x => x.exists),
      ...dbChecks.map(x => x.exists),
      duck.domainConfigured,
      duck.tokenConfigured,
      pm2.ok
    ];

    const readinessPercent = Math.round(
      (buckets.filter(Boolean).length / buckets.length) * 100
    );

    return res.json({
      success: true,
      readinessPercent,
      files: fileChecks,
      pages: pageChecks,
      database: db,
      expectedTables: dbChecks,
      integrations: {
        duckdns: duck,
        pm2: {
          ok: pm2.ok,
          output: pm2.stdout || pm2.stderr || pm2.error || ''
        }
      },
      git: {
        dirty: !!(git.stdout || '').trim(),
        output: git.stdout || ''
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate system audit report',
      error: error.message
    });
  }
};

exports.routes = async (req, res) => {
  try {
    const candidates = [
      '/api/domains',
      '/api/infrastructure/config',
      '/api/network/config',
      '/api/apps',
      '/api/deployments',
      '/api/docker',
      '/api/ddns/status',
      '/api/runtime/status'
    ];

    return res.json({
      success: true,
      routes: candidates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to build route list',
      error: error.message
    });
  }
};
