window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function safeJson(url, options) {
  const res = await apiFetch(url, options || {});
  const out = await res.json();
  if (!res.ok) throw new Error(out.message || 'Request failed');
  return out;
}

function roleCard(roleItem) {
  const perms = Array.isArray(roleItem.permissions) ? roleItem.permissions : [];
  return `
    <div class="list-card">
      <strong>${roleItem.role}</strong><br>
      <span class="muted">${perms.includes('*') ? 'Full access' : perms.join(', ') || 'No permissions'}</span>
    </div>
  `;
}

function userCard(user) {
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  return `
    <div class="list-card">
      <strong>${user.username}</strong><br>
      <span class="muted">Role: ${user.role || '-'}</span><br>
      <span class="muted">${perms.includes('*') ? 'Full access' : perms.join(', ') || 'No permissions'}</span>
      <div class="actions" style="margin-top:10px">
        <select data-role-select="${user.id}">
          <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>viewer</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
          <option value="super_admin" ${user.role === 'super_admin' ? 'selected' : ''}>super_admin</option>
        </select>
        <button class="primary-btn" data-save-role="${user.id}" type="button">Save Role</button>
      </div>
    </div>
  `;
}

async function renderPage() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'SECURITY',
    title: 'Permissions Matrix',
    subtitle: 'Inspect role mappings and update user roles safely.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>Permissions Controls</h2>
        </div>
        <div class="actions">
          <button id="refresh-permission-matrix-btn" class="ghost-btn" type="button">Refresh</button>
          <a href="/pages/permissions-pro.html" class="ghost-btn">Open Permissions</a>
        </div>
      </div>
    </section>

    <section id="debug-box" class="card" style="margin-top:18px">
      <div class="muted">Loading debug info...</div>
    </section>

    <section id="roles-box" class="card" style="margin-top:18px">
      <div class="muted">Loading roles...</div>
    </section>

    <section id="users-box" class="card" style="margin-top:18px">
      <div class="muted">Loading users...</div>
    </section>
  `;

  document.getElementById('refresh-permission-matrix-btn').onclick = () => renderPage();

  const debugBox = document.getElementById('debug-box');
  const rolesBox = document.getElementById('roles-box');
  const usersBox = document.getElementById('users-box');

  try {
    const [debugData, matrixData] = await Promise.all([
      safeJson('/api/debug-permissions/me'),
      safeJson('/api/permission-matrix/summary')
    ]);

    const debugUser = debugData.data?.user || null;
    const roles = matrixData.data?.roles || [];
    const users = matrixData.data?.users || [];

    debugBox.innerHTML = `
      <div class="kicker">DEBUG</div>
      <h2>Current Permission Context</h2>
      <pre style="white-space:pre-wrap;margin-top:8px">${JSON.stringify(debugUser, null, 2)}</pre>
    `;

    rolesBox.innerHTML = `
      <div class="kicker">ROLES</div>
      <h2>Role Permission Map</h2>
      ${roles.length ? roles.map(roleCard).join('') : '<div class="muted">No roles found</div>'}
    `;

    usersBox.innerHTML = `
      <div class="kicker">USERS</div>
      <h2>User Role Assignments</h2>
      ${users.length ? users.map(userCard).join('') : '<div class="muted">No users found</div>'}
    `;

    document.querySelectorAll('[data-save-role]').forEach(btn => {
      btn.onclick = async () => {
        const userId = btn.dataset.saveRole;
        const select = document.querySelector(`[data-role-select="${userId}"]`);
        const role = select ? select.value : '';
        try {
          await safeJson(`/api/permission-matrix/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
          });
          USGEnhancedUI?.success('Role Updated', 'User role updated successfully');
          renderPage();
        } catch (error) {
          USGEnhancedUI?.error('Role Update Failed', error.message);
        }
      };
    });
  } catch (error) {
    debugBox.innerHTML = `<div class="muted">Debug load failed: ${error.message}</div>`;
    rolesBox.innerHTML = `<div class="muted">Roles load failed: ${error.message}</div>`;
    usersBox.innerHTML = `<div class="muted">Users load failed: ${error.message}</div>`;
  }
}

renderPage();
