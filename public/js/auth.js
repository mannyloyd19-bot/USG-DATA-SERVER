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
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function apiFetch(url, options = {}) {
  const headers = authHeaders(options.headers || {});
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    location.href = '/login.html';
    throw new Error('Unauthorized');
  }

  return res;
}

function requireAuth() {
  if (!getToken()) {
    location.href = '/login.html';
  }
}

function logout() {
  clearToken();
  window.location.replace('/login.html');
}

window.getToken = getToken;
window.setToken = setToken;
window.clearToken = clearToken;
window.setUser = setUser;
window.getUser = getUser;
window.authHeaders = authHeaders;
window.apiFetch = apiFetch;
window.requireAuth = requireAuth;
window.logout = logout;
