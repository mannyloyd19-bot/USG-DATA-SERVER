requireAuth();
USGShell.buildShell();

async function loadUsers() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'USERS',
    title: 'Users',
    subtitle: 'Manage platform accounts',
    actions: [
      {
        label: '+ Create User',
        primary: true,
        onClick: () => USGCrudKit.create({
          title: 'Create User',
          endpoint: '/api/users',
          fields: [
            { name: 'username', label: 'Username' },
            { name: 'email', label: 'Email' },
            { name: 'password', label: 'Password' },
            { name: 'role', label: 'Role' }
          ],
          onDone: () => loadUsers()
        })
      }
    ]
  });

  try {
    const res = await apiFetch('/api/users');
    const data = await res.json();
    const users = data.users || [];

    content.innerHTML += users.length ? users.map(u => `
      <div class="list-card">
        <strong>${u.username || u.email}</strong><br>
        <span class="muted">${u.email || ''}</span><br>
        <span class="muted">Role: ${u.role || '-'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(u.status || 'active')}
          <button class="ghost-btn" data-edit="${u.id}">Edit</button>
          <button class="danger-btn" data-delete="${u.id}">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No users found' });

    users.forEach(u => {
      const editBtn = document.querySelector(`[data-edit="${u.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit User',
          endpoint: `/api/users/${u.id}`,
          initial: {
            username: u.username || '',
            email: u.email || '',
            role: u.role || ''
          },
          fields: [
            { name: 'username', label: 'Username' },
            { name: 'email', label: 'Email' },
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
loadUsers();
