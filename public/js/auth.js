function getToken() {
  return localStorage.getItem('usg_token') || '';
}

function setToken(token) {
  localStorage.setItem('usg_token', token);
}

function clearToken() {
  localStorage.removeItem('usg_token');
  localStorage.removeItem('usg_user');
  sessionStorage.clear();
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
    logout(true);
    throw new Error('Unauthorized');
  }

  return res;
}

function requireAuth() {
  if (!getToken()) {
    window.location.replace('/login.html');
  }
}

function logout(force = false) {
  try {
    clearToken();
  } catch {}

  const target = '/login.html';

  if (force) {
    window.location.replace(target);
    return;
  }

  setTimeout(() => {
    window.location.replace(target);
  }, 10);
}

function bindLogoutButtons() {
  document.querySelectorAll('[data-logout]').forEach((el) => {
    if (el.dataset.logoutBound === 'true') return;
    el.dataset.logoutBound = 'true';

    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      logout();
    });
  });
}

document.addEventListener('DOMContentLoaded', bindLogoutButtons);
window.addEventListener('load', bindLogoutButtons);

window.getToken = getToken;
window.setToken = setToken;
window.clearToken = clearToken;
window.getUser = getUser;
window.authHeaders = authHeaders;
window.apiFetch = apiFetch;
window.requireAuth = requireAuth;
window.logout = logout;
window.bindLogoutButtons = bindLogoutButtons;
