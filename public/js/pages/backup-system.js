requireAuth();
USGShell.buildShell();

function humanBytes(v) {
  const n = Number(v || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function loadBackupSystem() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">BACKUP SYSTEM</div>
      <h1 style="margin:6px 0 0;font-size:32px">Data Safety Center</h1>
      <div class="muted">Run manual backups, enable scheduled backups, set retention policy, and review restore-ready history.</div>
    </section>

    <div class="grid-2" style="margin-top:18px">
      <section class="card">
        <div class="kicker">BACKUP CONFIG</div>
        <h2>Scheduler Settings</h2>
        <form id="backup-config-form">
          <input id="backupDir" placeholder="Backup directory">
          <input id="sourceDbPath" placeholder="Source DB path">
          <div class="row-top">
            <input id="intervalMinutes" type="number" placeholder="Interval minutes">
            <input id="retentionCount" type="number" placeholder="Retention count">
          </div>
          <div class="actions">
            <button class="primary-btn" type="submit">Save Backup Config</button>
            <button class="ghost-btn" type="button" id="backup-run-now">Run Backup Now</button>
            <button class="ghost-btn" type="button" id="backup-enable-auto">Enable Auto</button>
            <button class="danger-btn" type="button" id="backup-disable-auto">Disable Auto</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">BACKUP STATUS</div>
        <h2>Auto / Runtime Status</h2>
        <pre id="backup-status-box">Loading...</pre>
      </section>
    </div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">BACKUP HISTORY</div>
      <h2>Recent Snapshots</h2>
      <div id="backup-jobs-list">Loading...</div>
    </section>
  `;

  const form = document.getElementById('backup-config-form');
  const statusBox = document.getElementById('backup-status-box');
  const jobsList = document.getElementById('backup-jobs-list');

  async function refresh() {
    const res = await apiFetch('/api/backup-system/status');
    const data = await res.json();

    const cfg = data.config || {};
    document.getElementById('backupDir').value = cfg.backupDir || 'storage/backups';
    document.getElementById('sourceDbPath').value = cfg.sourceDbPath || './database.sqlite';
    document.getElementById('intervalMinutes').value = cfg.intervalMinutes || 60;
    document.getElementById('retentionCount').value = cfg.retentionCount || 10;

    statusBox.textContent = JSON.stringify({
      autoRunning: data.autoRunning,
      config: data.config
    }, null, 2);

    const rows = Array.isArray(data.jobs) ? data.jobs : [];
    jobsList.innerHTML = rows.map(item => `
      <div class="list-card">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <strong>${item.fileName}</strong><br>
            <span class="muted">path: ${item.filePath}</span><br>
            <span class="muted">size: ${humanBytes(item.sizeBytes)} · trigger: ${item.triggerType}</span><br>
            <span class="muted">created: ${new Date(item.createdAt).toLocaleString()}</span><br>
            <span class="muted">exists: ${item.fileExists ? 'yes' : 'no'}</span>
          </div>
          <div class="badge ${item.status === 'completed' ? 'ok' : 'warn'}">
            <span class="badge-dot"></span>${item.status}
          </div>
        </div>
      </div>
    `).join('') || '<div class="muted">No backups found.</div>';

    USGShell.setupRawToggles(content);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      backupDir: document.getElementById('backupDir').value.trim(),
      sourceDbPath: document.getElementById('sourceDbPath').value.trim(),
      intervalMinutes: Number(document.getElementById('intervalMinutes').value || 60),
      retentionCount: Number(document.getElementById('retentionCount').value || 10)
    };

    const res = await apiFetch('/api/backup-system/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Failed to save backup config');
      return;
    }

    await refresh();
    alert('Backup config saved');
  });

  document.getElementById('backup-run-now').addEventListener('click', async () => {
    const res = await apiFetch('/api/backup-system/run', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Backup failed');
      return;
    }
    await refresh();
  });

  document.getElementById('backup-enable-auto').addEventListener('click', async () => {
    const minutes = Number(document.getElementById('intervalMinutes').value || 60);
    const res = await apiFetch('/api/backup-system/enable-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intervalMinutes: minutes })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Failed to enable auto backup');
      return;
    }
    await refresh();
  });

  document.getElementById('backup-disable-auto').addEventListener('click', async () => {
    const res = await apiFetch('/api/backup-system/disable-auto', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Failed to disable auto backup');
      return;
    }
    await refresh();
  });

  await refresh();
}

loadBackupSystem();
