requireAuth();
USGShell.buildShell();

async function loadWebhooks() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'WEBHOOKS',
    title: 'Webhooks',
    subtitle: 'Manage outbound event delivery endpoints'
  });

  try {
    const res = await apiFetch('/api/webhooks');
    const data = await res.json();
    const rows = data.webhooks || data.data || [];

    content.innerHTML += rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.event || 'Webhook'}</strong><br>
        <span class="muted">${item.url || item.endpoint || ''}</span><br>
        <div class="actions">${USGPageKit.statusBadge(item.status || 'active')}</div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No webhooks found' });
  } catch (err) {
    USGIOSAlert.show({ title: 'Webhooks Error', message: err.message, type: 'error' });
  }
}
loadWebhooks();
