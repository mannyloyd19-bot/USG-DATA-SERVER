window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadBackups() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'BACKUPS',
    title: 'Backup System',
    subtitle: 'Manage backups, snapshots, and restore points'
  });

  const actions = document.createElement('section');
  actions.className = 'card';
  actions.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Backup Controls</h2>
      </div>
      <div class="actions">
        <button id="create-backup-btn" class="primary-btn" type="button">+ Create Backup</button>
        <button id="refresh-backups-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actions);

  document.getElementById('refresh-backups-btn').onclick = loadBackups;

  document.getElementById('create-backup-btn').onclick = async () => {
    try {
      await apiFetch('/api/backups', { method: 'POST' });
      USGIOSAlert.show({ title: 'Backup Created' });
      loadBackups();
    } catch (e) {
      USGIOSAlert.show({ title: 'Backup Failed', message: e.message, type: 'error' });
    }
  };

  try {
    const res = await apiFetch('/api/backups');
    const data = await res.json();
    const rows = data.backups || [];

    const wrap = document.createElement('section');
    wrap.innerHTML = rows.length ? rows.map(b => `
      <div class="list-card">
        <strong>${b.filename || 'Backup'}</strong><br>
        <span class="muted">${b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</span><br>
        <span class="muted">${b.size || 0} bytes</span>
        <div class="actions">
          <button class="ghost-btn" data-restore="${b.filename}" type="button">Restore</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No backups found' });

    content.appendChild(wrap);

    rows.forEach(b => {
      const r = document.querySelector(`[data-restore="${b.filename}"]`);
      if (r) {
        r.onclick = async () => {
          try {
            await apiFetch(`/api/backups/restore/${encodeURIComponent(b.filename)}`, { method: 'POST' });
            USGIOSAlert.show({ title: 'Restore Scheduled', message: 'Restart the server to apply the selected backup.' });
          } catch (e) {
            USGIOSAlert.show({ title: 'Restore Failed', message: e.message, type: 'error' });
          }
        };
      }
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'Backup Error', message: err.message, type: 'error' });
  }
}

loadBackups();
