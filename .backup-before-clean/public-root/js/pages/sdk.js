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

  content.innerHTML += `
    <section class="card" style="margin-top:18px">
      <div class="kicker">NODE / JS</div>
      <h2>Quick Start</h2>
      <pre>const usg = new USGClient({
  baseURL: 'https://usgdataserver.duckdns.org',
  apiKey: 'usg_sk_live_xxxxx'
});</pre>
    </section>
  `;
}
loadSdk();
