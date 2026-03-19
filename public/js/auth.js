function getToken() {
  return localStorage.getItem('usg_token') || '';
}

function clearToken() {
  localStorage.removeItem('usg_token');
  localStorage.removeItem('usg_user');
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
  const res = await fetch(url, {
    ...options,
    headers: authHeaders(options.headers || {})
  });

  if (res.status === 401) {
    clearToken();
    window.location.replace('/login.html');
    throw new Error('Unauthorized');
  }

  return res;
}

function requireAuth() {
  if (!getToken()) {
    window.location.replace('/login.html');
  }
}

function logout() {
  clearToken();
  window.location.replace('/login.html');
}

window.getToken = getToken;
window.getUser = getUser;
window.authHeaders = authHeaders;
window.apiFetch = apiFetch;
window.requireAuth = requireAuth;
window.logout = logout;
