requireAuth();
USGShell.buildShell();

async function loadUsers() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'USERS',
    title: 'Users',
    subtitle: 'Manage system users'
  });

  content.innerHTML += USGPageKit.loadingState();

  const res = await apiFetch('/api/users');
  const data = await res.json();

  content.innerHTML += (data.users || []).map(u => `
    <div class="list-card">
      <strong>${u.email}</strong><br>
      <span class="muted">${u.role}</span>
      ${USGPageKit.statusBadge(u.status)}
    </div>
  `).join('');
}

loadUsers();
