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

  try {
    const res = await apiFetch('/api/permissions');
    const data = await res.json();
    const rows = data.permissions || data.roles || [];

    content.innerHTML += rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.role || 'Permission'}</strong><br>
        <span class="muted">${item.description || ''}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No permissions found' });
  } catch (err) {
    USGIOSAlert.show({ title: 'Permissions Error', message: err.message, type: 'error' });
  }
}
loadPermissions();
