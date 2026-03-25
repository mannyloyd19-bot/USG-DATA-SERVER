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

function statusBadge(value) {
  const v = String(value || '').toLowerCase();
  if (v.includes('success') || v.includes('ok')) return USGPageKit.statusBadge('online');
  if (v.includes('running') || v.includes('pending')) return USGPageKit.statusBadge('warning');
  if (v.includes('fail') || v.includes('error')) return USGPageKit.statusBadge('error');
  return USGPageKit.statusBadge('neutral');
}

function infoCard(title, value, desc) {
  return `
    <section class="card">
      <div class="kicker">BACKUPS</div>
      <h2>${title}</h2>
      <div class="info-value" style="font-size:28px;font-weight:800">${value}</div>
      <div class="muted">${desc}</div>
    </section>
  `;
}

function backupCard(item) {
  return `
    <div class="list-card">
      <strong>${item.name || 'Backup'}</strong><br>
      <span class="muted">Status: ${item.status || 'unknown'}</span><br>
      <span class="muted">Created: ${item.createdAt || item.created_at || '-'}</span><br>
      <span class="muted">Size: ${item.size || item.fileSize || '-'}</span>
      <div class="actions" style="margin-top:10px">
        ${statusBadge(item.status)}
      </div>
    </div>
  `;
}

async function loadBackupMonitor() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'OPERATIONS',
    title: 'Backup Monitor',
    subtitle: 'Track backup runs, status, and recovery readiness'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Backup Controls</h2>
      </div>
      <div class="actions">
        <button id="backup-refresh-btn" class="ghost-btn">Refresh</button>
        <a href="/pages/backups.html" class="primary-btn">Open Backups</a>
        <a href="/pages/system-health.html" class="ghost-btn">System Health</a>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('backup-refresh-btn').onclick = () => loadBackupMonitor();

  const loading = document.createElement('section');
  loading.className = 'card';
  loading.style.marginTop = '18px';
  loading.innerHTML = `<div class="muted">Loading backup monitor...</div>`;
  content.appendChild(loading);

  try {
    const [statusData, backupsData] = await Promise.all([
      safeJson('/api/backup-system/status'),
      safeJson('/api/backups')
    ]);

    loading.remove();

    const rows = Array.isArray(backupsData)
      ? backupsData
      : (backupsData.backups || backupsData.data || []);

    const autoEnabled = pick(statusData, ['autoEnabled', 'enabled'], false);
    const lastRun = pick(statusData, ['lastRunAt', 'lastBackupAt'], '-');
    const lastStatus = pick(statusData, ['lastStatus', 'status'], 'unknown');

    const successCount = rows.filter(r => String(r.status).toLowerCase().includes('success')).length;
    const failedCount = rows.filter(r => String(r.status).toLowerCase().includes('fail')).length;

    content.innerHTML += `
      <div class="grid-4" style="margin-top:18px">
        ${infoCard('Auto Backup', autoEnabled ? 'Enabled' : 'Disabled', 'Automatic backup system')}
        ${infoCard('Last Run', lastRun, 'Most recent execution')}
        ${infoCard('Successful', successCount, 'Completed backups')}
        ${infoCard('Failed', failedCount, 'Backups needing attention')}
      </div>
    `;

    content.innerHTML += `
      <section class="card" style="margin-top:18px">
        <div class="usg-page-head-row">
          <div>
            <div class="kicker">BACKUP HISTORY</div>
            <h2>Recent Backups</h2>
          </div>
          <div class="actions">
            ${statusBadge(lastStatus)}
          </div>
        </div>
        ${
          rows.length
            ? rows.slice(0, 15).map(backupCard).join('')
            : USGPageKit.emptyState({ title: 'No backups found' })
        }
      </section>
    `;

    content.innerHTML += `
      <section class="card" style="margin-top:18px">
        <div class="kicker">QUICK ACTIONS</div>
        <h2>Backup Operations</h2>
        <div class="actions" style="flex-wrap:wrap">
          <a href="/pages/backups.html" class="ghost-btn">Manage Backups</a>
          <a href="/pages/queue-monitor.html" class="ghost-btn">Queue Monitor</a>
          <a href="/pages/log-viewer.html" class="ghost-btn">Log Viewer</a>
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
      <h2>Backup Monitor Failed</h2>
      <div class="muted">${error.message}</div>
    `;
    content.appendChild(err);
  }
}

loadBackupMonitor();
