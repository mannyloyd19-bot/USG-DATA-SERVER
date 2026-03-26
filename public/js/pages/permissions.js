window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

let permissionsRoles = [];
let permissionsList = [];
let selectedRoleKey = '';

async function safeJson(url, options) {
  try {
    const res = await apiFetch(url, options || {});
    return await res.json();
  } catch {
    return {};
  }
}

function normalizeArray(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function normalizeRoleKey(item) {
  return String(item?.key || item?.name || item?.role || '').trim();
}

function normalizePermissionKey(item) {
  return String(item?.key || item?.name || '').trim();
}

function pageSection(title, body, kicker = 'SECURITY') {
  return `
    <section class="card" style="margin-top:18px">
      <div class="kicker">${kicker}</div>
      <h2>${title}</h2>
      ${body}
    </section>
  `;
}

function infoCard(title, value, desc) {
  return `
    <section class="card">
      <div class="kicker">PERMISSIONS</div>
      <h2>${title}</h2>
      <div class="info-value" style="font-size:28px;font-weight:800">${value}</div>
      <div class="muted">${desc}</div>
    </section>
  `;
}

function groupPermissions(rows) {
  const map = {};
  for (const item of rows) {
    const key = normalizePermissionKey(item);
    const group = key.includes('.') ? key.split('.')[0] : 'general';
    if (!map[group]) map[group] = [];
    map[group].push(item);
  }
  return map;
}

function permissionCard(item) {
  const key = normalizePermissionKey(item) || '-';
  const name = item?.name || key;
  const desc = item?.description || item?.label || 'Permission entry';
  return `
    <div class="list-card">
      <strong>${name}</strong><br>
      <span class="muted">Key: ${key}</span><br>
      <span class="muted">Description: ${desc}</span>
    </div>
  `;
}

function filterPermissionsForRole(rows, roleKey) {
  if (!roleKey) return rows;
  const lower = String(roleKey).toLowerCase();

  return rows.filter((item) => {
    const role = String(item?.role || item?.roleKey || item?.assignedRole || '').toLowerCase();
    const roles = Array.isArray(item?.roles) ? item.roles.map(r => String(r).toLowerCase()) : [];
    if (role && role === lower) return true;
    if (roles.includes(lower)) return true;

    if (!role && !roles.length) {
      if (lower === 'admin') return true;
    }

    return false;
  });
}

function renderPermissionsPage() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const roleOptions = permissionsRoles.map((role) => {
    const key = normalizeRoleKey(role);
    const label = role?.name || role?.key || role?.role || key;
    return `<option value="${key}" ${selectedRoleKey === key ? 'selected' : ''}>${label}</option>`;
  }).join('');

  const visiblePermissions = filterPermissionsForRole(permissionsList, selectedRoleKey);
  const grouped = groupPermissions(visiblePermissions);
  const groupNames = Object.keys(grouped).sort();

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SECURITY',
    title: 'Permissions',
    subtitle: 'Inspect role permissions and security registry entries'
  });

  content.innerHTML += `
    <section class="card">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>Permission Controls</h2>
        </div>
        <div class="actions">
          <button id="permissions-refresh-btn" class="ghost-btn" type="button">Refresh</button>
          <a href="/pages/rbac.html" class="primary-btn">Open RBAC</a>
        </div>
      </div>

      <div class="grid-2" style="margin-top:18px">
        <div>
          <label class="muted">Role Filter</label>
          <select id="permissions-role-filter" style="width:100%;margin-top:6px">
            <option value="">All Roles</option>
            ${roleOptions}
          </select>
        </div>
        <div>
          <label class="muted">Overview</label>
          <div class="muted" style="margin-top:12px">
            Review permissions by role and grouped permission domain.
          </div>
        </div>
      </div>
    </section>
  `;

  content.innerHTML += `
    <div class="grid-3" style="margin-top:18px">
      ${infoCard('Roles', permissionsRoles.length, 'Available RBAC roles')}
      ${infoCard('Permissions', permissionsList.length, 'Registered permission entries')}
      ${infoCard('Visible', visiblePermissions.length, 'Permissions shown in current view')}
    </div>
  `;

  if (!visiblePermissions.length) {
    content.innerHTML += pageSection(
      'Permission Registry',
      USGPageKit.emptyState({ title: 'No permissions found for the current view' })
    );
  } else {
    content.innerHTML += pageSection(
      'Permission Groups',
      groupNames.map((group) => `
        <section class="card" style="margin-top:14px">
          <div class="kicker">GROUP</div>
          <h2>${group}</h2>
          ${grouped[group].map(permissionCard).join('')}
        </section>
      `).join(''),
      'REGISTRY'
    );
  }

  document.getElementById('permissions-refresh-btn').onclick = () => initPermissionsPage();
  document.getElementById('permissions-role-filter').onchange = (e) => {
    selectedRoleKey = String(e.target.value || '');
    renderPermissionsPage();
  };
}

async function initPermissionsPage() {
  const content = document.getElementById('page-content');
  if (content) {
    content.innerHTML = `<section class="card"><div class="muted">Loading permissions...</div></section>`;
  }

  const [rolesRes, permissionsRes] = await Promise.all([
    safeJson('/api/rbac/roles'),
    safeJson('/api/rbac/permissions')
  ]);

  permissionsRoles = normalizeArray(rolesRes, ['roles', 'data']);
  permissionsList = normalizeArray(permissionsRes, ['permissions', 'data']);

  if (!selectedRoleKey && permissionsRoles.length) {
    selectedRoleKey = normalizeRoleKey(permissionsRoles[0]);
  }

  renderPermissionsPage();
}

initPermissionsPage();
