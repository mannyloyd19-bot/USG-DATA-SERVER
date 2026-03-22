window.__DISABLE_HEALTH_BANNER__ = true;
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

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Audit Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-audit-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-audit-btn').onclick = () => loadAuditLogs();

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search audit logs...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/audit-logs');
    const data = await res.json();
    const rows = data.logs || data.auditLogs || data.data || [];

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.action || item.event || 'Event'}</strong><br>
        <span class="muted">${item.module || item.resource || ''}</span><br>
        <span class="muted">${item.createdAt || item.timestamp || ''}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No audit logs found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});
  } catch (err) {
    USGIOSAlert.show({ title: 'Audit Logs Error', message: err.message, type: 'error' });
  }
}
loadAuditLogs();
