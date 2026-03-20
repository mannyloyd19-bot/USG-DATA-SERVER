requireAuth();
USGShell.buildShell();

function bytesToGb(v) {
  return (Number(v || 0) / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

async function loadInfrastructure() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">INFRASTRUCTURE CENTER</div>
      <h1 style="margin:6px 0 0;font-size:32px">Global Access + Runtime Control</h1>
      <div class="muted">Manage DDNS, SSL readiness, runtime status, PM2 processes, and self-hosted provider controls.</div>
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">DOMAIN / DDNS</div>
        <h2>Global Setup</h2>
        <form id="infra-form">
          <div class="row-top">
            <select id="infra-mode">
              <option value="on_prem">on_prem</option>
              <option value="hybrid">hybrid</option>
              <option value="cloud">cloud</option>
            </select>
            <select id="infra-domain-type">
              <option value="ddns">ddns</option>
              <option value="custom">custom</option>
              <option value="local">local</option>
            </select>
          </div>

          <input id="infra-custom-domain" placeholder="Custom domain (example: api.company.com)">
          <input id="infra-subdomain" placeholder="Internal alias (example: api.usg)">
          <div class="row-top">
            <input id="infra-ddns-provider" placeholder="DDNS provider (duckdns)">
            <input id="infra-ddns-domain" placeholder="example.duckdns.org">
          </div>
          <input id="infra-ddns-token" placeholder="DuckDNS token">
          <div class="row-top">
            <input id="infra-app-port" type="number" placeholder="App port">
            <input id="infra-public-port" type="number" placeholder="Public port">
          </div>
          <div class="row-top">
            <select id="infra-ssl-enabled">
              <option value="false">SSL disabled</option>
              <option value="true">SSL enabled</option>
            </select>
            <select id="infra-reverse-proxy-enabled">
              <option value="false">Reverse proxy disabled</option>
              <option value="true">Reverse proxy enabled</option>
            </select>
          </div>
          <textarea id="infra-notes" rows="4" placeholder="Notes / deployment remarks"></textarea>
          <div class="actions">
            <button class="primary-btn" type="submit">Save Config</button>
            <button class="ghost-btn" type="button" id="refresh-global-status">Refresh</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">SSL CENTER</div>
        <h2>HTTPS / Reverse Proxy</h2>
        <div id="ssl-cards"></div>
        <pre id="nginx-guide-box" style="margin-top:16px">Loading...</pre>
      </section>
    </div>

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">DDNS AUTO UPDATE</div>
        <h2>DuckDNS Engine</h2>
        <div class="actions">
          <button class="primary-btn" type="button" id="ddns-run">Run Update Now</button>
          <button class="ghost-btn" type="button" id="ddns-enable">Enable Auto</button>
          <button class="danger-btn" type="button" id="ddns-disable">Disable Auto</button>
        </div>
        <pre id="ddns-status-box" style="margin-top:16px">Loading...</pre>
      </section>

      <section class="card">
        <div class="kicker">GLOBAL STATUS</div>
        <h2>Public Access Readiness</h2>
        <div id="infra-status-cards"></div>
        <pre id="infra-runtime-box" style="margin-top:16px">Loading...</pre>
      </section>
    </div>

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">PM2 RUNTIME</div>
        <h2>Process Manager</h2>
        <div class="actions">
          <button class="primary-btn" type="button" id="pm2-restart-all">Restart All</button>
          <button class="ghost-btn" type="button" id="pm2-stop-all">Stop All</button>
          <button class="ghost-btn" type="button" id="pm2-start-default">Start Default</button>
          <button class="ghost-btn" type="button" id="pm2-refresh">Refresh PM2</button>
        </div>
        <pre id="pm2-box" style="margin-top:16px">Loading...</pre>
      </section>

      <section class="card">
        <div class="kicker">PM2 LOGS</div>
        <h2>Runtime Logs</h2>
        <div class="actions">
          <button class="ghost-btn" type="button" id="pm2-load-logs">Load Logs</button>
        </div>
        <pre id="pm2-logs-box" style="margin-top:16px">No logs loaded yet.</pre>
      </section>
    </div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">RAW CONFIG</div>
      <h2>Infrastructure JSON</h2>
      <pre id="infra-config-box">Loading...</pre>
    </section>
  `;

  const form = document.getElementById('infra-form');
  const statusCards = document.getElementById('infra-status-cards');
  const runtimeBox = document.getElementById('infra-runtime-box');
  const configBox = document.getElementById('infra-config-box');
  const ddnsStatusBox = document.getElementById('ddns-status-box');
  const pm2Box = document.getElementById('pm2-box');
  const pm2LogsBox = document.getElementById('pm2-logs-box');
  const sslCards = document.getElementById('ssl-cards');
  const nginxGuideBox = document.getElementById('nginx-guide-box');

  async function refreshInfra() {
    const [configRes, statusRes] = await Promise.all([
      apiFetch('/api/infrastructure/config'),
      apiFetch('/api/infrastructure/global-status')
    ]);

    const configData = await configRes.json();
    const statusData = await statusRes.json();

    const cfg = configData.config || {};
    document.getElementById('infra-mode').value = cfg.mode || 'on_prem';
    document.getElementById('infra-domain-type').value = cfg.domainType || 'ddns';
    document.getElementById('infra-custom-domain').value = cfg.customDomain || '';
    document.getElementById('infra-subdomain').value = cfg.subdomain || '';
    document.getElementById('infra-ddns-provider').value = cfg.ddnsProvider || 'duckdns';
    document.getElementById('infra-ddns-domain').value = cfg.ddnsDomain || '';
    document.getElementById('infra-ddns-token').value = cfg.ddnsToken || '';
    document.getElementById('infra-app-port').value = cfg.appPort || 3000;
    document.getElementById('infra-public-port').value = cfg.publicPort || 3000;
    document.getElementById('infra-ssl-enabled').value = String(!!cfg.sslEnabled);
    document.getElementById('infra-reverse-proxy-enabled').value = String(!!cfg.reverseProxyEnabled);
    document.getElementById('infra-notes').value = cfg.notes || '';

    const checks = statusData.checks || {};
    statusCards.innerHTML = `
      <div class="grid-3">
        <div class="info-card">
          <div class="info-title">Readiness</div>
          <div class="info-value">${statusData.readinessPercent || 0}%</div>
        </div>
        <div class="info-card">
          <div class="info-title">Public IP</div>
          <div class="info-value" style="font-size:16px">${statusData.runtime?.publicIp || 'N/A'}</div>
        </div>
        <div class="info-card">
          <div class="info-title">Global URL</div>
          <div class="info-value" style="font-size:16px">${statusData.runtime?.globalUrl || 'Not ready'}</div>
        </div>
      </div>
      <div style="margin-top:16px">
        ${Object.entries(checks).map(([key, value]) => `
          <div class="flag-row">
            <strong>${key}</strong>
            <span>${value ? 'READY' : 'MISSING'}</span>
          </div>
        `).join('')}
      </div>
    `;

    runtimeBox.textContent = JSON.stringify(configData.runtime || {}, null, 2);
    configBox.textContent = JSON.stringify(configData, null, 2);

    sslCards.innerHTML = `
      <div class="grid-3">
        <div class="info-card">
          <div class="info-title">SSL</div>
          <div class="info-value" style="font-size:18px">${cfg.sslEnabled ? 'Enabled' : 'Disabled'}</div>
        </div>
        <div class="info-card">
          <div class="info-title">Reverse Proxy</div>
          <div class="info-value" style="font-size:18px">${cfg.reverseProxyEnabled ? 'Enabled' : 'Disabled'}</div>
        </div>
        <div class="info-card">
          <div class="info-title">Public Port</div>
          <div class="info-value" style="font-size:18px">${cfg.publicPort || 3000}</div>
        </div>
      </div>
    `;

    nginxGuideBox.textContent = [
      'server {',
      '  listen 80;',
      `  server_name ${cfg.customDomain || cfg.ddnsDomain || 'your-domain'};`,
      '  location / {',
      `    proxy_pass http://127.0.0.1:${cfg.appPort || 3000};`,
      '    proxy_set_header Host $host;',
      '    proxy_set_header X-Real-IP $remote_addr;',
      '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
      '    proxy_set_header X-Forwarded-Proto $scheme;',
      '  }',
      '}'
    ].join('\n');

    USGShell.setupRawToggles(content);
  }

  async function refreshDdns() {
    const res = await apiFetch('/api/ddns/status');
    const data = await res.json();
    ddnsStatusBox.textContent = JSON.stringify(data, null, 2);
    USGShell.setupRawToggles(content);
  }

  async function refreshPm2() {
    const res = await apiFetch('/api/runtime/status');
    const data = await res.json();

    let parsed = [];
    try {
      parsed = JSON.parse(data.pm2Json || '[]');
    } catch {}

    pm2Box.textContent = JSON.stringify({
      system: {
        ...data.system,
        freeMemHuman: bytesToGb(data.system?.freeMem),
        totalMemHuman: bytesToGb(data.system?.totalMem)
      },
      pm2Apps: parsed.map(app => ({
        name: app.name,
        pid: app.pid,
        status: app.pm2_env?.status,
        restarts: app.pm2_env?.restart_time
      })),
      pm2Text: data.pm2Text
    }, null, 2);

    USGShell.setupRawToggles(content);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      mode: document.getElementById('infra-mode').value,
      domainType: document.getElementById('infra-domain-type').value,
      customDomain: document.getElementById('infra-custom-domain').value.trim(),
      subdomain: document.getElementById('infra-subdomain').value.trim(),
      ddnsProvider: document.getElementById('infra-ddns-provider').value.trim(),
      ddnsDomain: document.getElementById('infra-ddns-domain').value.trim(),
      ddnsToken: document.getElementById('infra-ddns-token').value.trim(),
      appPort: Number(document.getElementById('infra-app-port').value || 3000),
      publicPort: Number(document.getElementById('infra-public-port').value || 3000),
      sslEnabled: document.getElementById('infra-ssl-enabled').value === 'true',
      reverseProxyEnabled: document.getElementById('infra-reverse-proxy-enabled').value === 'true',
      notes: document.getElementById('infra-notes').value.trim()
    };

    const res = await apiFetch('/api/infrastructure/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Failed to save config');
      return;
    }

    await refreshInfra();
    alert('Infrastructure config saved');
  });

  document.getElementById('refresh-global-status').addEventListener('click', async () => {
    await refreshInfra();
    await refreshDdns();
    await refreshPm2();
  });

  document.getElementById('ddns-run').addEventListener('click', async () => {
    const res = await apiFetch('/api/ddns/run', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'DuckDNS update failed');
      return;
    }
    await refreshDdns();
    await refreshInfra();
  });

  document.getElementById('ddns-enable').addEventListener('click', async () => {
    const res = await apiFetch('/api/ddns/enable-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ everyMs: 300000 })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Failed to enable DDNS auto-update');
      return;
    }
    await refreshDdns();
  });

  document.getElementById('ddns-disable').addEventListener('click', async () => {
    const res = await apiFetch('/api/ddns/disable-auto', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Failed to disable DDNS auto-update');
      return;
    }
    await refreshDdns();
  });

  document.getElementById('pm2-restart-all').addEventListener('click', async () => {
    await apiFetch('/api/runtime/pm2/restart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'all' })
    });
    await refreshPm2();
  });

  document.getElementById('pm2-stop-all').addEventListener('click', async () => {
    await apiFetch('/api/runtime/pm2/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'all' })
    });
    await refreshPm2();
  });

  document.getElementById('pm2-start-default').addEventListener('click', async () => {
    await apiFetch('/api/runtime/pm2/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: 'src/server.js', name: 'usg-data-server' })
    });
    await refreshPm2();
  });

  document.getElementById('pm2-refresh').addEventListener('click', refreshPm2);

  document.getElementById('pm2-load-logs').addEventListener('click', async () => {
    const res = await apiFetch('/api/runtime/pm2/logs?lines=80');
    const data = await res.json();
    pm2LogsBox.textContent = JSON.stringify(data, null, 2);
    USGShell.setupRawToggles(content);
  });

  await refreshInfra();
  await refreshDdns();
  await refreshPm2();
}

loadInfrastructure();
