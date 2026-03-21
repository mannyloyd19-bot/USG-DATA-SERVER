requireAuth();
USGShell.buildShell();

async function loadAppHealth() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'HOSTING',
    title: 'App Health',
    subtitle: 'Monitor and control running apps'
  });

  const res = await apiFetch('/api/hosting-health/summary');
  const data = await res.json();
  const apps = data.hosting?.apps || [];

  content.innerHTML = apps.map(app => `
    <div class="list-card">
      <strong>${app.name}</strong><br>
      <span class="muted">port: ${app.port}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(app.status)}
        <button data-restart="${app.id}">Restart</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-restart]').forEach(btn => {
    btn.onclick = async () => {
      const ok = await USGConfirm('Restart app?');
      if (!ok) return;

      await apiFetch(`/api/apps/${btn.dataset.restart}/restart`, { method: 'POST' });
      loadAppHealth();
    };
  });
}
loadAppHealth();
