requireAuth();
USGShell.buildShell();

async function loadRealtime() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'REALTIME',
    title: 'Realtime',
    subtitle: 'Realtime channels and live event status'
  });

  try {
    const res = await apiFetch('/api/realtime-insights/summary');
    const data = await res.json();
    const rows = data.realtime?.channels || [];

    content.innerHTML += rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name}</strong><br>
        <span class="muted">events: ${item.events || 0}</span>
        <div class="actions">${USGPageKit.statusBadge(item.status || 'idle')}</div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No realtime channels found' });
  } catch (err) {
    USGIOSAlert.show({ title: 'Realtime Error', message: err.message, type: 'error' });
  }
}
loadRealtime();
