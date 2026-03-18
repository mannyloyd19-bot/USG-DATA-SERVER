const form = document.getElementById('login-form');
const errorBox = document.getElementById('error-box');

if (localStorage.getItem('usg_token')) {
  location.href = '/';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = '';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

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
