function getToken() {
  return localStorage.getItem('usg_token') || '';
}

function setToken(token) {
  localStorage.setItem('usg_token', token);
}

function clearToken() {
  localStorage.removeItem('usg_token');
  localStorage.removeItem('usg_user');
}

function setUser(user) {
  localStorage.setItem('usg_user', JSON.stringify(user || null));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('usg_user') || 'null');
  } catch {
    return null;
  }
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    Authorization: token ? `Bearer ${token}` : ''
  };
}

async function apiFetch(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    ...authHeaders(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    if (!location.pathname.endsWith('/login.html')) {
      location.href = '/login.html';
    }
    throw new Error('Unauthorized');
  }

  return res;
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    location.href = '/login.html';
  }
}

function logout() {
  clearToken();
  location.href = '/login.html';
}

window.logout = logout;
