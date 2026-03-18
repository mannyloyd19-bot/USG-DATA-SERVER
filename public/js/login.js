function showTab(tabName) {
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.style.display = el.getAttribute('data-tab') === tabName ? 'block' : 'none';
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-open') === tabName);
  });

  const errorBox = document.getElementById('error-box');
  errorBox.textContent = '';
}

const loginForm = document.getElementById('login-form');
const createForm = document.getElementById('create-form');
const forgotForm = document.getElementById('forgot-form');
const errorBox = document.getElementById('error-box');

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => showTab(btn.getAttribute('data-open')));
});

if (localStorage.getItem('usg_token')) {
  location.href = '/';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = '';

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('usg_token', data.token);
    localStorage.setItem('usg_user', JSON.stringify(data.user || null));
    location.href = '/';
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = '';

  const masterKey = document.getElementById('create-masterkey').value.trim();
  const username = document.getElementById('create-username').value.trim();
  const password = document.getElementById('create-password').value;
  const role = document.getElementById('create-role').value;

  try {
    const res = await fetch('/api/bootstrap/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-master-key': masterKey
      },
      body: JSON.stringify({ username, password, role, masterKey })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Create user failed');
    }

    errorBox.style.color = '#1f7a3d';
    errorBox.textContent = 'User created successfully. You can now log in.';
    createForm.reset();
    showTab('login');
  } catch (error) {
    errorBox.style.color = '#c0392b';
    errorBox.textContent = error.message;
  }
});

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = '';

  const masterKey = document.getElementById('forgot-masterkey').value.trim();
  const username = document.getElementById('forgot-username').value.trim();
  const newPassword = document.getElementById('forgot-password').value;

  try {
    const res = await fetch('/api/bootstrap/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-master-key': masterKey
      },
      body: JSON.stringify({ username, newPassword, masterKey })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Reset password failed');
    }

    errorBox.style.color = '#1f7a3d';
    errorBox.textContent = 'Password reset successfully. You can now log in.';
    forgotForm.reset();
    showTab('login');
  } catch (error) {
    errorBox.style.color = '#c0392b';
    errorBox.textContent = error.message;
  }
});

showTab('login');
