window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function safeJson(url) {
  try {
    const res = await apiFetch(url);
    return await res.json();
  } catch {
    return {};
  }
}

function toCount(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function pick(obj, keys, fallback = '-') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  return fallback;
}

function statusTone(value) {
  const v = String(value || '').toLowerCase();
  if (['ok', 'healthy', 'online', 'success', 'active', 'ready'].includes(v)) return 'online';
  if (['warning', 'degraded', 'pending'].includes(v)) return 'warning';
  if (['error', 'offline', 'failed', 'down'].includes(v)) return 'error';
  return 'neutral';
}

function statusBadge(value) {
  return USGPageKit.statusBadge(statusTone(value) === 'online' ? 'online' : statusTone(value) === 'warning' ? 'warning' : statusTone(value) === 'error' ? 'error' : 'neutral');
}

function infoCard(title, value, desc) {
  return `
    <section class="card">
      <div class="kicker">SYSTEM</div>
      <h2>${title}</h2>
      <div class="info-value" style="font-size:28px;font-weight:800">${value}</div>
      <div class="muted">${desc}</div>
    </section>
  `;
}

function detailCard(title, body) {
  return `
    <section class="card">
      <div class="kicker">DETAIL</div>
      <h2>${title}</h2>
      ${body}
    </section>
  `;
}

async function loadSystemHealth() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'OPERATIONS',
    title: 'System Health',
    subtitle: 'Monitor runtime, readiness, backups, jobs, and overall platform status'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Health Controls</h2>
      </div>
      <div class="actions">
        <button id="system-health-refresh-btn" class="ghost-btn" type="button">Refresh</button>
        <a href="/pages/diagnostics-console.html" class="ghost-btn">Diagnostics</a>
        <a href="/pages/log-viewer.html" class="ghost-btn">Log Viewer</a>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('system-health-refresh-btn').onclick = () => loadSystemHealth();

  const loading = document.createElement('section');
  loading.className = 'card';
  loading.style.marginTop = '18px';
  loading.innerHTML = `<div class="muted">Loading system health...</div>`;
  content.appendChild(loading);

  try {
    const [health, runtime, backupStatus, jobs, readiness] = await Promise.all([
      safeJson('/api/system-monitoring/health'),
      safeJson('/api/system-monitoring/runtime'),
      safeJson('/api/backup-system/status'),
      safeJson('/api/job-queue'),
      safeJson('/api/live-readiness/status')
    ]);

    loading.remove();

    const healthStatus = pick(health, ['status', 'health', 'state'], 'unknown');
    const dbStatus = pick(health, ['databaseStatus', 'dbStatus', 'database', 'db'], 'unknown');
    const uptime = pick(runtime, ['uptime', 'uptimeHuman', 'processUptime'], '-');
    const env = pick(runtime, ['environment', 'env', 'nodeEnv'], 'development');
    const port = pick(runtime, ['port'], '3000');
    const version = pick(runtime, ['version', 'appVersion'], '1.0.0');

    const backupEnabled = pick(backupStatus, ['autoEnabled', 'enabled', 'autoBackupEnabled'], false);
    const backupLastRun = pick(backupStatus, ['lastRunAt', 'lastBackupAt', 'lastRun'], '-');
    const backupLastStatus = pick(backupStatus, ['lastStatus', 'status'], 'unknown');

    const jobRows = Array.isArray(jobs) ? jobs : (jobs.jobs || jobs.data || []);
    const pendingJobs = jobRows.filter(j => String(j.status || '').toLowerCase() === 'pending').length;
    const runningJobs = jobRows.filter(j => String(j.status || '').toLowerCase() === 'running').length;
    const failedJobs = jobRows.filter(j => String(j.status || '').toLowerCase() === 'failed').length;

    const readinessPercent = toCount(pick(readiness, ['readinessPercent', 'percent', 'score'], 0), 0);

    content.innerHTML += `
      <div class="grid-4" style="margin-top:18px">
        ${infoCard('Platform Status', String(healthStatus).toUpperCase(), 'Overall server health')}
        ${infoCard('Database', String(dbStatus).toUpperCase(), 'Database connectivity state')}
        ${infoCard('Readiness', `${readinessPercent}%`, 'Install and live-readiness score')}
        ${infoCard('Uptime', uptime, 'Current process uptime')}
      </div>
    `;

    content.innerHTML += `
      <div class="grid-3" style="margin-top:18px">
        ${detailCard('Runtime', `
          <div class="list-card"><strong>Status</strong><br><span class="muted">${healthStatus}</span></div>
          <div class="list-card"><strong>Environment</strong><br><span class="muted">${env}</span></div>
          <div class="list-card"><strong>Port</strong><br><span class="muted">${port}</span></div>
          <div class="list-card"><strong>Version</strong><br><span class="muted">${version}</span></div>
        `)}

        ${detailCard('Backups', `
          <div class="list-card"><strong>Auto Backup</strong><br><span class="muted">${String(backupEnabled) === 'true' || backupEnabled === true ? 'Enabled' : 'Disabled'}</span></div>
          <div class="list-card"><strong>Last Run</strong><br><span class="muted">${backupLastRun}</span></div>
          <div class="list-card"><strong>Last Status</strong><br><span class="muted">${backupLastStatus}</span></div>
          <div class="actions" style="margin-top:12px">
            <a href="/pages/backups.html" class="ghost-btn">Open Backups</a>
            <a href="/pages/backup-monitor.html" class="ghost-btn">Backup Monitor</a>
          </div>
        `)}

        ${detailCard('Queue', `
          <div class="list-card"><strong>Pending</strong><br><span class="muted">${pendingJobs}</span></div>
          <div class="list-card"><strong>Running</strong><br><span class="muted">${runningJobs}</span></div>
          <div class="list-card"><strong>Failed</strong><br><span class="muted">${failedJobs}</span></div>
          <div class="actions" style="margin-top:12px">
            <a href="/pages/queue-monitor.html" class="ghost-btn">Queue Monitor</a>
          </div>
        `)}
      </div>
    `;

    content.innerHTML += `
      <section class="card" style="margin-top:18px">
        <div class="usg-page-head-row">
          <div>
            <div class="kicker">QUICK LINKS</div>
            <h2>System Actions</h2>
          </div>
          <div class="actions">
            ${statusBadge(healthStatus)}
            ${statusBadge(dbStatus)}
          </div>
        </div>

        <div class="actions" style="margin-top:14px;flex-wrap:wrap">
          <a href="/pages/diagnostics-console.html" class="primary-btn">Open Diagnostics</a>
          <a href="/pages/log-viewer.html" class="ghost-btn">Open Logs</a>
          <a href="/pages/domain-diagnostics.html" class="ghost-btn">Domain Diagnostics</a>
          <a href="/pages/app-logs.html" class="ghost-btn">App Logs</a>
          <a href="/pages/settings.html" class="ghost-btn">Settings</a>
        </div>
      </section>
    `;
  } catch (error) {
    loading.remove();

    const err = document.createElement('section');
    err.className = 'card';
    err.style.marginTop = '18px';
    err.innerHTML = `
      <div class="kicker">ERROR</div>
      <h2>System Health Failed</h2>
      <div class="muted">${error.message}</div>
    `;
    content.appendChild(err);
  }
}

loadSystemHealth();
