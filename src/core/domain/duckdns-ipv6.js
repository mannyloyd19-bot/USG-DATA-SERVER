const https = require('https');
const { getPublicIPs } = require('../network/ip-detector');

async function updateDuckDNSFull() {
  const domain = process.env.DUCKDNS_DOMAIN;
  const token = process.env.DUCKDNS_TOKEN;

  if (!domain || !token) {
    console.log('DuckDNS not configured');
    return;
  }

  const { ipv4, ipv6 } = await getPublicIPs();

  const url = `https://www.duckdns.org/update?domains=${domain}&token=${token}&ip=${ipv4 || ''}&ipv6=${ipv6 || ''}`;

  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('[DuckDNS FULL UPDATE]', data);
      console.log('IPv4:', ipv4);
      console.log('IPv6:', ipv6);
    });
  }).on('error', (err) => {
    console.error('DuckDNS update error:', err.message);
  });
}

module.exports = { updateDuckDNSFull };
