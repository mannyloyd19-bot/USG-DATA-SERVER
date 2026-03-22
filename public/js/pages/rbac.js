window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadRBAC() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SECURITY',
    title: 'RBAC & Row-Level Security',
    subtitle: 'Manage roles, permissions, and tenant-scoped security'
  });

  content.innerHTML = `
    <section class="card">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>Security Controls</h2>
        </div>
        <div class="actions">
          <button id="seed-rbac-btn" class="primary-btn" type="button">Seed Defaults</button>
        </div>
      </div>
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">ROLES</div>
        <h2>Role Registry</h2>
        <div id="rbac-roles">Loading...</div>
      </section>

      <section class="card">
        <div class="kicker">PERMISSIONS</div>
        <h2>Permission Registry</h2>
        <div id="rbac-permissions">Loading...</div>
      </section>
    </div>

    <section class="card">
      <div class="kicker">MY ACCESS</div>
      <h2>Resolved Permissions</h2>
      <div id="rbac-my-permissions">Loading...</div>
    </section>
  `;

  document.getElementById('seed-rbac-btn').onclick = async () => {
    const res = await apiFetch('/api/rbac/seed', { method: 'POST' });
    const out = await res.json();
    USGIOSAlert.show({
      title: out.success ? 'RBAC Seeded' : 'Seed Failed',
      message: out.success ? 'Default roles and permissions created' : (out.message || 'Failed'),
      type: out.success ? 'success' : 'error'
    });
    loadRBAC();
  };

  try {
    const [rolesRes, permsRes, myPermsRes] = await Promise.all([
      apiFetch('/api/rbac/roles'),
      apiFetch('/api/rbac/permissions'),
      apiFetch('/api/rbac/my-permissions', {
        headers: { 'x-user-id': localStorage.getItem('usg_user_id') || '' }
      })
    ]);

    const roles = (await rolesRes.json()).roles || [];
    const permissions = (await permsRes.json()).permissions || [];
    const myPermissions = (await myPermsRes.json()).permissions || [];

    document.getElementById('rbac-roles').innerHTML = roles.length
      ? roles.map(r => `<div class="list-card"><strong>${r.name}</strong><br><span class="muted">${r.key}</span></div>`).join('')
      : '<div class="muted">No roles yet.</div>';

    document.getElementById('rbac-permissions').innerHTML = permissions.length
      ? permissions.map(p => `<div class="list-card"><strong>${p.name}</strong><br><span class="muted">${p.key}</span></div>`).join('')
      : '<div class="muted">No permissions yet.</div>';

    document.getElementById('rbac-my-permissions').innerHTML = myPermissions.length
      ? myPermissions.map(p => `<div class="list-card"><strong>${p}</strong></div>`).join('')
      : '<div class="muted">No resolved permissions yet.</div>';
  } catch (error) {
    USGIOSAlert.show({ title: 'RBAC Error', message: error.message, type: 'error' });
  }
}
loadRBAC();
