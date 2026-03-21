requireAuth();
USGShell.buildShell();

async function loadNetworkCenter() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">ROUTER / NETWORK CENTER</div>
      <h1 style="margin:6px 0 0;font-size:32px">Port Forwarding + Public Access</h1>
      <div class="muted">Configure router mapping, public gateway, DDNS access, local network details, and self-hosted provider routing.</div>
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">PORT FORWARDING</div>
        <h2>Router Mapping Config</h2>
        <form id="network-form">
          <input id="router-ip" placeholder="Router IP (example: 192.168.1.1)">
          <input id="local-server-ip" placeholder="Local server IP (example: 192.168.1.10)">
          <div class="row-top">
            <input id="app-port" type="number" placeholder="App port">
            <input id="public-port" type="number" placeholder="Public port">
          </div>
          <div class="row-top">
            <select id="protocol">
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="TCP/UDP">TCP/UDP</option>
            </select>
            <select id="provider-mode">
              <option value="self_hosted">self_hosted</option>
              <option value="hybrid">hybrid</option>
              <option value="private_cloud">private_cloud</option>
            </select>
          </div>
          <input id="domain-gateway" placeholder="Domain gateway / public host">
          <input id="ddns-domain" placeholder="DDNS domain (example: yourname.duckdns.org)">
          <div class="row-top">
            <select id="ssl-enabled">
              <option value="false">SSL disabled</option>
              <option value="true">SSL enabled</option>
            </select>
            <select id="proxy-enabled">
              <option value="false">Reverse proxy disabled</option>
              <option value="true">Reverse proxy enabled</option>
            </select>
          </div>
          <textarea id="network-notes" rows="4" placeholder="Network notes / router remarks"></textarea>
          <div class="actions">
            <button class="primary-btn" type="submit">Save Network Config</button>
            <button class="ghost-btn" type="button" id="refresh-network">Refresh Network</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">CHECKLIST</div>
        <h2>Readiness Score</h2>
        <div id="network-check-cards"></div>
      </section>
    </div>

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">NETWORK SNAPSHOT</div>
        <h2>Interfaces / IP Info</h2>
        <pre id="network-runtime-box">Loading...</pre>
      </section>

      <section class="card">
        <div class="kicker">PORT FORWARDING GUIDE</div>
        <h2>Router Steps</h2>
        <pre id="network-guide-box">Loading...</pre>
      </section>
    </div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">RAW CONFIG</div>
      <h2>Network JSON</h2>
      <pre id="network-config-box">Loading...</pre>
    </section>
  `;

  const form = document.getElementById('network-form');
  const runtimeBox = document.getElementById('network-runtime-box');
  const guideBox = document.getElementById('network-guide-box');
  const configBox = document.getElementById('network-config-box');
  const checkCards = document.getElementById('network-check-cards');

  async function refreshAll() {
    const [configRes, checklistRes] = await Promise.all([
      apiFetch('/api/network/config'),
      apiFetch('/api/network/checklist')
    ]);

    const configData = await configRes.json();
    const checklistData = await checklistRes.json();

    const cfg = configData.config || {};
    document.getElementById('router-ip').value = cfg.routerIp || '';
    document.getElementById('local-server-ip').value = cfg.localServerIp || '';
    document.getElementById('app-port').value = cfg.appPort || 3000;
    document.getElementById('public-port').value = cfg.publicPort || 3000;
    document.getElementById('protocol').value = cfg.protocol || 'TCP';
    document.getElementById('provider-mode').value = cfg.providerMode || 'self_hosted';
    document.getElementById('domain-gateway').value = cfg.domainGateway || '';
    document.getElementById('ddns-domain').value = cfg.ddnsDomain || '';
    document.getElementById('ssl-enabled').value = String(!!cfg.sslEnabled);
    document.getElementById('proxy-enabled').value = String(!!cfg.reverseProxyEnabled);
    document.getElementById('network-notes').value = cfg.notes || '';

    checkCards.innerHTML = `
      <div class="grid-3">
        <div class="info-card">
          <div class="info-title">Readiness</div>
          <div class="info-value">${checklistData.readinessPercent || 0}%</div>
        </div>
        <div class="info-card">
          <div class="info-title">Public IP</div>
          <div class="info-value" style="font-size:16px">${checklistData.publicIp || 'N/A'}</div>
        </div>
        <div class="info-card">
          <div class="info-title">Interfaces</div>
          <div class="info-value" style="font-size:16px">${(checklistData.localInterfaces || []).length}</div>
        </div>
      </div>
      <div style="margin-top:16px">
        ${Object.entries(checklistData.checks || {}).map(([key, value]) => `
          <div class="flag-row">
            <strong>${key}</strong>
            <span>${value ? 'READY' : 'MISSING'}</span>
          </div>
        `).join('')}
      </div>
    `;

    runtimeBox.textContent = JSON.stringify(configData.runtime || {}, null, 2);
    guideBox.textContent = configData.guide || 'No guide available.';
    configBox.textContent = JSON.stringify(configData, null, 2);

    USGShell.setupRawToggles(content);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      routerIp: document.getElementById('router-ip').value.trim(),
      localServerIp: document.getElementById('local-server-ip').value.trim(),
      appPort: Number(document.getElementById('app-port').value || 3000),
      publicPort: Number(document.getElementById('public-port').value || 3000),
      protocol: document.getElementById('protocol').value,
      providerMode: document.getElementById('provider-mode').value,
      domainGateway: document.getElementById('domain-gateway').value.trim(),
      ddnsDomain: document.getElementById('ddns-domain').value.trim(),
      sslEnabled: document.getElementById('ssl-enabled').value === 'true',
      reverseProxyEnabled: document.getElementById('proxy-enabled').value === 'true',
      notes: document.getElementById('network-notes').value.trim()
    };

    const res = await apiFetch('/api/network/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Failed to save network config');
      return;
    }

    await refreshAll();
    alert('Network config saved');
  });

  document.getElementById('refresh-network').addEventListener('click', refreshAll);

  await refreshAll();
}

loadNetworkCenter();
