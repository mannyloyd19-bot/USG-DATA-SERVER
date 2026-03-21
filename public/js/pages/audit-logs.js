requireAuth();
USGShell.buildShell();

async function loadAuditLogs() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'AUDIT',
    title: 'Audit Logs',
    subtitle: 'Track actions and changes across the platform'
  });

  try {
    const res = await apiFetch('/api/audit-logs');
    const data = await res.json();
    const rows = data.logs || data.auditLogs || data.data || [];

    content.innerHTML += rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.action || item.event || 'Event'}</strong><br>
        <span class="muted">${item.module || item.resource || ''}</span><br>
        <span class="muted">${item.createdAt || item.timestamp || ''}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No audit logs found' });
  } catch (err) {
    USGIOSAlert.show({ title: 'Audit Logs Error', message: err.message, type: 'error' });
  }
}
loadAuditLogs();
