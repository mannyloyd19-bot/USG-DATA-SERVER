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
  actions.style.marginTop = '18px';
  actions.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Backup Controls</h2>
      </div>
      <div class="actions">
        <button id="create-backup-btn" class="primary-btn">+ Create Backup</button>
        <button id="refresh-backups-btn" class="ghost-btn">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actions);

  document.getElementById('refresh-backups-btn').onclick = loadBackups;

  document.getElementById('create-backup-btn').onclick = async () => {
    try {
      await apiFetch('/api/backups/create', { method: 'POST' });
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
    wrap.style.marginTop = '18px';
    wrap.innerHTML = rows.length ? rows.map(b => `
      <div class="list-card">
        <strong>${b.name || 'Backup'}</strong><br>
        <span class="muted">${b.createdAt || ''}</span>
        <div class="actions">
          <button class="ghost-btn" data-restore="${b.id}">Restore</button>
          <button class="danger-btn" data-delete="${b.id}">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No backups found' });

    content.appendChild(wrap);

    rows.forEach(b => {
      const r = document.querySelector(`[data-restore="${b.id}"]`);
      if (r) {
        r.onclick = async () => {
          await apiFetch(`/api/backups/${b.id}/restore`, { method: 'POST' });
          USGIOSAlert.show({ title: 'Restore started' });
        };
      }
    });

  } catch (err) {
    USGIOSAlert.show({ title: 'Backup Error', message: err.message, type: 'error' });
  }
}
loadBackups();
