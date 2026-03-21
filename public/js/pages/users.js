USGPageBootstrap.init('Users');

async function loadUsers() {
  try {
    const content = document.getElementById('page-content');

    const res = await apiFetch('/api/users').catch(() => null);
    const data = res ? await res.json() : {};
    const users = data.users || [];

    content.innerHTML = users.length
      ? users.map(u => `
        <div class="list-card">
          <strong>${u.username}</strong><br>
          <span class="muted">Role: ${u.role}</span>
        </div>
      `).join('')
      : USGPageKit.emptyState({ title: 'No users found' });

  } catch (err) {
    USGPageBootstrap.error(err);
  }
}

loadUsers();
