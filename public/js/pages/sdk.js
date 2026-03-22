window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadSdk() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SDK',
    title: 'SDK',
    subtitle: 'Developer integration resources and examples'
  });

  const card = document.createElement('section');
  card.className = 'card';
  card.style.marginTop = '18px';
  card.innerHTML = `
    <div class="kicker">NODE / JS</div>
    <h2>Quick Start</h2>
    <pre>const usg = new USGClient({
  baseURL: 'https://usgdataserver.duckdns.org',
  apiKey: 'usg_sk_live_xxxxx'
});</pre>
  `;

  content.appendChild(card);
}

loadSdk();
