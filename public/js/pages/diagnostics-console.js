window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function safeJson(url, options) {
  try {
    const res = await apiFetch(url, options || {});
    return await res.json();
  } catch {
    return {};
  }
}

function pick(obj, keys, fallback = '-') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  return fallback;
}

function block(title, body) {
  return `
    <section class="card">
      <div class="kicker">DIAGNOSTICS</div>
      <h2>${title}</h2>
      ${body}
    </section>
  `;
}

function renderJson(value) {
  return `<pre style="white-space:pre-wrap">${JSON.stringify(value || {}, null, 2)}</pre>`;
}

async function loadDiagnosticsConsole() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'OPERATIONS',
    title: 'Diagnostics Console',
    subtitle: 'Inspect runtime diagnostics, logs preview, and live system checks'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Diagnostics Controls</h2>
      </div>
      <div class="actions">
        <button id="diagnostics-refresh-btn" class="ghost-btn" type="button">Refresh</button>
        <button id="diagnostics-test-log-btn" class="ghost-btn" type="button">Send Test Log</button>
        <a href="/pages/system-health.html" class="ghost-btn">System Health</a>
        <a href="/pages/log-viewer.html" class="ghost-btn">Log Viewer</a>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('diagnostics-refresh-btn').onclick = () => loadDiagnosticsConsole();

  document.getElementById('diagnostics-test-log-btn').onclick = async () => {
    try {
      const result = await safeJson('/api/diagnostics/test-log', { method: 'POST' });
      USGIOSAlert.show({
        title: 'Diagnostics',
        message: result.message || 'Test log submitted'
      });
      loadDiagnosticsConsole();
    } catch (error) {
      USGIOSAlert.show({
        title: 'Diagnostics Error',
        message: error.message,
        type: 'error'
      });
    }
  };

  const loading = document.createElement('section');
  loading.className = 'card';
  loading.style.marginTop = '18px';
  loading.innerHTML = `<div class="muted">Loading diagnostics console...</div>`;
  content.appendChild(loading);

  try {
    const [consoleData, logsData, runtimeData, healthData] = await Promise.all([
      safeJson('/api/diagnostics/console'),
      safeJson('/api/diagnostics/logs'),
      safeJson('/api/system-monitoring/runtime'),
      safeJson('/api/system-monitoring/health')
    ]);

    loading.remove();

    const logs = Array.isArray(logsData) ? logsData : (logsData.logs || logsData.data || []);
    const recentLogs = logs.slice(0, 8);

    const runtimeSummary = {
      environment: pick(runtimeData, ['environment', 'env', 'nodeEnv'], 'development'),
      uptime: pick(runtimeData, ['uptime', 'uptimeHuman', 'processUptime'], '-'),
      version: pick(runtimeData, ['version', 'appVersion'], '1.0.0'),
      port: pick(runtimeData, ['port'], '3000')
    };

    const healthSummary = {
      status: pick(healthData, ['status', 'health', 'state'], 'unknown'),
      database: pick(healthData, ['databaseStatus', 'dbStatus', 'database', 'db'], 'unknown')
    };

    content.innerHTML += `
      <div class="grid-3" style="margin-top:18px">
        ${block('Runtime Snapshot', `
          <div class="list-card"><strong>Environment</strong><br><span class="muted">${runtimeSummary.environment}</span></div>
          <div class="list-card"><strong>Uptime</strong><br><span class="muted">${runtimeSummary.uptime}</span></div>
          <div class="list-card"><strong>Version</strong><br><span class="muted">${runtimeSummary.version}</span></div>
          <div class="list-card"><strong>Port</strong><br><span class="muted">${runtimeSummary.port}</span></div>
        `)}

        ${block('Health Snapshot', `
          <div class="list-card"><strong>Platform</strong><br><span class="muted">${healthSummary.status}</span></div>
          <div class="list-card"><strong>Database</strong><br><span class="muted">${healthSummary.database}</span></div>
          <div class="actions" style="margin-top:12px">
            <a href="/pages/system-health.html" class="primary-btn">Open System Health</a>
          </div>
        `)}

        ${block('Quick Actions', `
          <div class="actions" style="flex-wrap:wrap">
            <a href="/pages/log-viewer.html" class="ghost-btn">View Full Logs</a>
            <a href="/pages/app-logs.html" class="ghost-btn">App Logs</a>
            <a href="/pages/domain-diagnostics.html" class="ghost-btn">Domain Diagnostics</a>
          </div>
        `)}
      </div>
    `;

    content.innerHTML += `
      <section class="card" style="margin-top:18px">
        <div class="kicker">LOG PREVIEW</div>
        <h2>Recent Diagnostics Logs</h2>
        ${
          recentLogs.length
            ? recentLogs.map(item => `
              <div class="list-card">
                <strong>${item.level || item.type || 'Log'}</strong><br>
                <span class="muted">${item.message || item.text || JSON.stringify(item)}</span>
              </div>
            `).join('')
            : USGPageKit.emptyState({ title: 'No diagnostics logs found' })
        }
      </section>
    `;

    content.innerHTML += `
      <div class="grid-2" style="margin-top:18px">
        ${block('Diagnostics Payload', renderJson(consoleData))}
        ${block('Runtime Payload', renderJson(runtimeData))}
      </div>
    `;

    if (window.USGShell && typeof window.USGShell.setupRawToggles === 'function') {
      window.USGShell.setupRawToggles(content);
    }
  } catch (error) {
    loading.remove();

    const err = document.createElement('section');
    err.className = 'card';
    err.style.marginTop = '18px';
    err.innerHTML = `
      <div class="kicker">ERROR</div>
      <h2>Diagnostics Console Failed</h2>
      <div class="muted">${error.message}</div>
    `;
    content.appendChild(err);
  }
}

loadDiagnosticsConsole();
