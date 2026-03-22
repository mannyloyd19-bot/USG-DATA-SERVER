window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPermissions() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SECURITY',
    title: 'Permissions',
    subtitle: 'Inspect role permissions and security registry entries'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Permission Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-permissions-btn" class="ghost-btn" type="button">Refresh</button>
        <a href="/pages/rbac.html" class="primary-btn">Open RBAC</a>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-permissions-btn').onclick = () => loadPermissions();

  try {
    const res = await apiFetch('/api/permissions');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.permissions || data.roles || []);

    const wrap = document.createElement('section');
    wrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.key || 'Permission'}</strong><br>
        <span class="muted">Key: ${item.key || '-'}</span><br>
        <span class="muted">Description: ${item.description || '-'}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No permissions found' });

    content.appendChild(wrap);
  } catch (error) {
    USGIOSAlert.show({ title: 'Permissions Error', message: error.message, type: 'error' });
  }
}

loadPermissions();
