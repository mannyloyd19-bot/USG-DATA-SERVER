const fs = require('fs');
const { exec } = require('child_process');

function run(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 20000, maxBuffer: 1024 * 1024 * 8 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout ? stdout.trim() : '',
        stderr: stderr ? stderr.trim() : '',
        error: error ? error.message : null
      });
    });
  });
}

function getGateway() {
  const d = process.env.DUCKDNS_DOMAIN;
  if (!d) return 'usgdataserver.duckdns.org';
  return d.includes('.duckdns.org') ? d : `${d}.duckdns.org`;
}

exports.status = async (req, res) => {
  try {
    const domain = req.query.domain || getGateway();
    const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;
    const keyPath = `/etc/letsencrypt/live/${domain}/privkey.pem`;

    const certExists = fs.existsSync(certPath);
    const keyExists = fs.existsSync(keyPath);

    const [nginx, certbot, renew] = await Promise.all([
      run('nginx -t'),
      run('certbot certificates'),
      run('certbot renew --dry-run')
    ]);

    return res.json({
      success: true,
      ssl: {
        domain,
        certPath,
        keyPath,
        certExists,
        keyExists,
        enabled: certExists && keyExists
      },
      nginx,
      certbot,
      renew
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
