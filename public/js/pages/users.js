window.__DISABLE_HEALTH_BANNER__ = true;

function bootUsersPage() {
  requireAuth();
  USGShell.buildShell();

  function validateUser(data, isEdit = false) {
    return USGValidationKit.collect(
      USGValidationKit.required(data.username, 'Username'),
      !isEdit || (data.password !== undefined && data.password !== '')
        ? USGValidationKit.minLength(data.password, 'Password', 6)
        : null,
      USGValidationKit.required(data.role, 'Role')
    );
  }

  async function loadUsers() {
    const content = document.getElementById('page-content');
    if (!content) {
      setTimeout(loadUsers, 120);
      return;
    }

    content.innerHTML = '';

    USGPageKit.setPageHeader({
      kicker: 'USERS',
      title: 'Users',
      subtitle: 'Manage platform accounts and roles'
    });

    const actionWrap = document.createElement('section');
    actionWrap.className = 'card';
    actionWrap.innerHTML = `
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>User Controls</h2>
        </div>
        <div class="actions">
          <button id="create-user-btn" class="primary-btn" type="button">+ Create User</button>
        </div>
      </div>
    `;
    content.appendChild(actionWrap);

    document.getElementById('create-user-btn').onclick = () => USGCrudKit.create({
      title: 'Create User',
      endpoint: '/api/users',
      validate: (data) => validateUser(data, false),
      fields: [
        { name: 'username', label: 'Username' },
        { name: 'password', label: 'Password' },
        { name: 'role', label: 'Role' }
      ],
      onDone: () => loadUsers()
    });

    const searchWrap = document.createElement('div');
    searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search users...' });
    content.appendChild(searchWrap);

    try {
      const res = await apiFetch('/api/users');
      const data = await res.json();
      const users = Array.isArray(data) ? data : (data.users || []);

      const listWrap = document.createElement('section');
      listWrap.innerHTML = users.length ? users.map(u => `
        <div class="list-card">
          <strong>${u.username || 'User'}</strong><br>
          <span class="muted">Role: ${u.role || '-'}</span><br>
          <span class="muted">Created: ${u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</span>
          <div class="actions">
            ${USGPageKit.statusBadge('active')}
            <button class="ghost-btn" data-edit="${u.id}" type="button">Edit</button>
            <button class="danger-btn" data-delete="${u.id}" type="button">Delete</button>
          </div>
        </div>
      `).join('') : USGPageKit.emptyState({ title: 'No users found' });

      content.appendChild(listWrap);
      USGPageKit.attachBasicSearch({});

      users.forEach(u => {
        const editBtn = document.querySelector(`[data-edit="${u.id}"]`);
        if (editBtn) {
          editBtn.onclick = () => USGCrudKit.edit({
            title: 'Edit User',
            endpoint: `/api/users/${u.id}`,
            validate: (data) => validateUser(data, true),
            initial: {
              username: u.username || '',
              role: u.role || ''
            },
            fields: [
              { name: 'username', label: 'Username' },
              { name: 'password', label: 'New Password (optional)' },
              { name: 'role', label: 'Role' }
            ],
            onDone: () => loadUsers()
          });
        }

        const delBtn = document.querySelector(`[data-delete="${u.id}"]`);
        if (delBtn) {
          delBtn.onclick = () => USGCrudKit.remove({
            title: 'Delete User',
            message: 'Delete this user?',
            endpoint: `/api/users/${u.id}`,
            onDone: () => loadUsers()
          });
        }
      });
    } catch (err) {
      USGIOSAlert.show({ title: 'Users Error', message: err.message, type: 'error' });
    }
  }

  setTimeout(loadUsers, 80);
}

bootUsersPage();
