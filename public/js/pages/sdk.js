window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function copyText(value, title = 'Copied') {
  try {
    await navigator.clipboard.writeText(value || '');
    USGIOSAlert.show({ title: 'Copied', message: title });
  } catch {
    USGIOSAlert.show({ title: 'Copy Failed', message: title, type: 'error' });
  }
}

async function loadSdk() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SDK',
    title: 'SDK',
    subtitle: 'Developer integration resources and examples'
  });

  const envBlock = `USG_API_BASE_URL=https://usgdataserver.duckdns.org
USG_DOMAIN_KEY=dom_your_domain_key
USG_APP_TOKEN=appreg_your_app_token
USG_API_KEY=your_api_key_here`;

  const fetchBlock = `fetch(\`\${USG_API_BASE_URL}/api/collections\`, {
  headers: {
    'x-domain-key': USG_DOMAIN_KEY,
    'x-app-token': USG_APP_TOKEN,
    'x-api-key': USG_API_KEY
  }
});`;

  const nodeBlock = `const config = {
  baseURL: 'https://usgdataserver.duckdns.org',
  domainKey: 'dom_your_domain_key',
  appToken: 'appreg_your_app_token',
  apiKey: 'your_api_key_here'
};`;

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <section class="card" style="margin-top:18px">
      <div class="kicker">PROJECT CONFIG</div>
      <h2>Environment Variables</h2>
      <pre>${envBlock}</pre>
      <div class="actions">
        <button class="ghost-btn" id="copy-sdk-env" type="button">Copy Env Block</button>
      </div>
    </section>

    <section class="card" style="margin-top:18px">
      <div class="kicker">FETCH EXAMPLE</div>
      <h2>Browser Request</h2>
      <pre>${fetchBlock}</pre>
      <div class="actions">
        <button class="ghost-btn" id="copy-sdk-fetch" type="button">Copy Fetch Example</button>
      </div>
    </section>

    <section class="card" style="margin-top:18px">
      <div class="kicker">NODE / JS</div>
      <h2>Client Config</h2>
      <pre>${nodeBlock}</pre>
      <div class="actions">
        <button class="ghost-btn" id="copy-sdk-node" type="button">Copy Node Example</button>
      </div>
    </section>

    <section class="card" style="margin-top:18px">
      <div class="kicker">NOTES</div>
      <h2>Integration Flow</h2>
      <div class="muted">
        1. Create a domain in Domain Registry.<br>
        2. Open the Binding panel.<br>
        3. Copy Domain Key and App Token.<br>
        4. Use your API key for authenticated requests.
      </div>
    </section>
  `;
  content.appendChild(wrap);

  document.getElementById('copy-sdk-env').onclick = () => copyText(envBlock, 'Env block copied');
  document.getElementById('copy-sdk-fetch').onclick = () => copyText(fetchBlock, 'Fetch example copied');
  document.getElementById('copy-sdk-node').onclick = () => copyText(nodeBlock, 'Node example copied');
}

loadSdk();
