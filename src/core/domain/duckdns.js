const axios = require('axios');

async function updateDuckDNS() {
  try {
    const domain = process.env.DUCKDNS_DOMAIN;
    const token = process.env.DUCKDNS_TOKEN;

    if (!domain || !token) {
      console.log('DuckDNS not configured');
      return;
    }

    const url = `https://www.duckdns.org/update?domains=${domain}&token=${token}&ip=`;

    const res = await axios.get(url);

    console.log('DuckDNS update:', res.data);
  } catch (err) {
    console.error('DuckDNS error:', err.message);
  }
}

module.exports = {
  updateDuckDNS
};
