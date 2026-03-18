requireAuth();

const backupListEl = document.getElementById('backup-list');
const createBtn = document.getElementById('create-backup');

async function loadBackups() {
  backupListEl.innerHTML = '<div class="muted">Loading backups...</div>';

  try {
    const res = await apiFetch('/api/backups');
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      backupListEl.innerHTML = '<div class="muted">No backups available.</div>';
      return;
    }

    backupListEl.innerHTML = items.map(item => `
      <div class="item-card">
        <div><strong>${item.filename}</strong></div>
        <div class="muted">${new Date(item.createdAt).toLocaleString()}</div>
        <div class="muted">${item.size} bytes</div>
      </div>
    `).join('');
  } catch (error) {
    backupListEl.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

createBtn.addEventListener('click', async () => {
  try {
    const res = await apiFetch('/api/backups', {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create backup');
    loadBackups();
  } catch (error) {
    alert(error.message);
  }
});

loadBackups();
