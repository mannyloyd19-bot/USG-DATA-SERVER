const https = require('https');

function fetchIP(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', () => resolve(null));
  });
}

async function getPublicIPs() {
  const ipv4 = await fetchIP('https://api.ipify.org');
  const ipv6 = await fetchIP('https://api64.ipify.org');

  return {
    ipv4: ipv4 || null,
    ipv6: ipv6 || null
  };
}

module.exports = { getPublicIPs };
