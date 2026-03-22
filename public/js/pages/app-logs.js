window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function logCard(item) {
  return `
    <div class="list-card">
      <strong>${item.level || 'log'}</strong><br>
      <span class="muted">${item.message || ''}</span><br>
      <span class="muted">${item.createdAt || ''}</span>
      ${item.meta ? `<pre style="white-space:pre-wrap;margin-top:8px">${JSON.stringify(item.meta, null, 2)}</pre>` : ''}
    </div>
  `;
}

function appCard(item) {
  return `
    <div class="list-card">
      <strong>${item.name || item.slug || 'App'}</strong><br>
      <span class="muted">Slug: ${item.slug || '-'}</span><br>
      <span class="muted">Status: ${item.status || '-'}</span><br>
      <span class="muted">Runtime: ${item.runtimeStatus || '-'}</span><br>
      <span class="muted">Health: ${item.healthStatus || '-'}</span><br>
      <span class="muted">Port: ${item.port || '-'}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(item.status || 'unknown')}
      </div>
    </div>
  `;
}

async function loadAppLogs() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'APP LOGS',
    title: 'App Logs',
    subtitle: 'Inspect runtime app logs and high-level application state'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>App Log Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-app-logs-btn" class="primary-btn" type="button">Refresh</button>
        <button id="test-app-log-btn" class="ghost-btn" type="button">Emit Test Log</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-app-logs-btn').onclick = () => loadAppLogs();
  document.getElementById('test-app-log-btn').onclick = async () => {
    await apiFetch('/api/app-logs/test-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'info', message: 'Manual app test log', meta: { source: 'app-logs-ui' } })
    });
    loadAppLogs();
  };

  try {
    const [logsRes, appsRes] = await Promise.all([
      apiFetch('/api/app-logs'),
      apiFetch('/api/app-logs/apps-summary')
    ]);

    const logsData = await logsRes.json();
    const appsData = await appsRes.json();

    const logs = logsData.logs || [];
    const apps = appsData.apps || [];

    const appsWrap = document.createElement('section');
    appsWrap.className = 'card';
    appsWrap.style.marginTop = '18px';
    appsWrap.innerHTML = `
      <div class="kicker">APPS</div>
      <h2>Application Summary</h2>
      ${apps.length ? apps.map(appCard).join('') : '<div class="muted">No apps found.</div>'}
    `;
    content.appendChild(appsWrap);

    const logsWrap = document.createElement('section');
    logsWrap.className = 'card';
    logsWrap.style.marginTop = '18px';
    logsWrap.innerHTML = `
      <div class="kicker">LOG STREAM</div>
      <h2>Recent App Logs</h2>
      ${logs.length ? logs.map(logCard).join('') : '<div class="muted">No app logs available.</div>'}
    `;
    content.appendChild(logsWrap);
  } catch (error) {
    USGIOSAlert.show({ title: 'App Logs Error', message: error.message, type: 'error' });
  }
}

loadAppLogs();
