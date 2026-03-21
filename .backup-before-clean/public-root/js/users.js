requireAuth();

const userListEl = document.getElementById('user-list');
const userFormEl = document.getElementById('user-form');

async function removeUser(userId, username) {
  const me = getUser();

  if (!confirm(`Delete user "${username}"?`)) return;

  if (me && me.id === userId) {
    alert('You cannot delete the currently logged-in user.');
    return;
  }

  try {
    const res = await apiFetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });

    let data = {};
    try { data = await res.json(); } catch {}

    if (!res.ok) throw new Error(data.message || 'Failed to delete user');

    loadUsers();
  } catch (error) {
    alert(error.message);
  }
}

async function loadUsers() {
  userListEl.innerHTML = '<div class="muted">Loading users...</div>';

  try {
    const res = await apiFetch('/api/users');
    const users = await res.json();

    if (!Array.isArray(users) || users.length === 0) {
      userListEl.innerHTML = '<div class="muted">No users found.</div>';
      return;
    }

    userListEl.innerHTML = users.map(user => `
      <div class="item-card">
        <div><strong>${user.username}</strong></div>
        <div class="muted">role: ${user.role}</div>
        <div class="muted">created: ${new Date(user.createdAt).toLocaleString()}</div>
        <div style="margin-top:10px">
          <button class="danger-btn" data-remove-id="${user.id}" data-remove-name="${user.username}">Remove User</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('[data-remove-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        removeUser(
          btn.getAttribute('data-remove-id'),
          btn.getAttribute('data-remove-name')
        );
      });
    });
  } catch (error) {
    userListEl.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

userFormEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    username: document.getElementById('user-username').value.trim(),
    password: document.getElementById('user-password').value,
    role: document.getElementById('user-role').value
  };

  try {
    const res = await apiFetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = {};
    try { data = await res.json(); } catch {}

    if (!res.ok) throw new Error(data.message || 'Failed to create user');

    userFormEl.reset();
    loadUsers();
  } catch (error) {
    alert(error.message);
  }
});

loadUsers();
