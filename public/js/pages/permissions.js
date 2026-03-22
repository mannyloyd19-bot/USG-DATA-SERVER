requireAuth();
USGShell.buildShell();

async function loadPermissions() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SECURITY',
    title: 'Permissions',
    subtitle: 'Review roles and permission assignments'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Permission Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-permissions-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-permissions-btn').onclick = () => loadPermissions();

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search permissions...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/permissions');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.permissions || data.roles || []);

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.role || 'Permission'}</strong><br>
        <span class="muted">${item.description || ''}</span>
        <div class="actions" style="margin-top:12px">
          ${USGPageKit.statusBadge(item.status || 'active')}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No permissions found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});
  } catch (err) {
    USGIOSAlert.show({ title: 'Permissions Error', message: err.message, type: 'error' });
  }
}
loadPermissions();
