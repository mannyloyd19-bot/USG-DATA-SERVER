const https = require('https');

function getPublicIp() {
  return new Promise((resolve) => {
    try {
      if (typeof fetch === 'function') {
        fetch('https://api.ipify.org?format=json')
          .then(r => r.json())
          .then(data => resolve(data.ip || null))
          .catch(() => resolve(null));
        return;
      }
    } catch {}

    https.get('https://api.ipify.org?format=json', (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          resolve(data.ip || null);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function updateDuckDNS(domain, token, ip) {
  return new Promise((resolve, reject) => {
    const url = `https://www.duckdns.org/update?domains=${encodeURIComponent(domain)}&token=${encodeURIComponent(token)}&ip=${encodeURIComponent(ip || '')}`;

    https.get(url, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        resolve({
          success: raw.trim() === 'OK',
          response: raw.trim()
        });
      });
    }).on('error', (error) => reject(error));
  });
}

module.exports = {
  getPublicIp,
  updateDuckDNS
};
