requireAuth();
USGShell.buildShell();

async function loadRestore() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'BACKUP',
    title: 'Restore System',
    subtitle: 'Restore from backup safely'
  });

  content.innerHTML = `
    <div class="card">
      <input id="backup-file" placeholder="backup-file.json">
      <button class="primary-btn" id="restore-btn">Restore</button>
    </div>
  `;

  document.getElementById('restore-btn').onclick = async () => {
    const file = document.getElementById('backup-file').value;
    const ok = await USGConfirm('Restore backup? This may overwrite data.');
    if (!ok) return;

    const res = await apiFetch('/api/backup-restore/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file })
    });

    const data = await res.json();

    if (!res.ok) {
      USGIOSAlert.show({ title: 'Restore Failed', message: data.message, type: 'error' });
      return;
    }

    USGIOSAlert.show({ title: 'Restore Started', message: data.message });
  };
}
loadRestore();
