window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadSessions() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SESSIONS',
    title: 'Sessions',
    subtitle: 'Manage active devices and login sessions'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Session Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-sessions-btn" class="ghost-btn" type="button">Refresh</button>
        <button id="logout-all-btn" class="danger-btn" type="button">Logout All</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-sessions-btn').onclick = () => loadSessions();

  document.getElementById('logout-all-btn').onclick = async () => {
    const res = await apiFetch('/api/sessions/logout-all', { method: 'POST' });
    const out = await res.json();
    USGIOSAlert.show({
      title: out.success ? 'All Sessions Revoked' : 'Logout Failed',
      message: out.message || 'Done',
      type: out.success ? 'success' : 'error'
    });
    loadSessions();
  };

  try {
    const res = await apiFetch('/api/sessions/mine', {
      headers: {
        'x-user-id': localStorage.getItem('usg_user_id') || ''
      }
    });
    const data = await res.json();
    const rows = data.sessions || [];

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.deviceLabel || 'Device'}</strong><br>
        <span class="muted">IP: ${item.ipAddress || '-'}</span><br>
        <span class="muted">Status: ${item.status || '-'}</span><br>
        <span class="muted">Last Seen: ${item.lastSeenAt || '-'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(item.status || 'active')}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No sessions found' });

    content.appendChild(listWrap);
  } catch (error) {
    USGIOSAlert.show({ title: 'Sessions Error', message: error.message, type: 'error' });
  }
}
loadSessions();
