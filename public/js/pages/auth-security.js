window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function metricCard(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title.toUpperCase()}</div>
      <h2>${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

function sessionCard(item) {
  return `
    <div class="list-card">
      <strong>Session ${item.id || ''}</strong><br>
      <span class="muted">Active: ${item.isActive ? 'Yes' : 'No'}</span><br>
      <span class="muted">Created: ${item.createdAt || ''}</span><br>
      <span class="muted">Revoked: ${item.revokedAt || '-'}</span><br>
      <span class="muted">User Agent: ${item.userAgent || '-'}</span><br>
      <span class="muted">IP: ${item.ipAddress || '-'}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(item.isActive ? 'active' : 'revoked')}
      </div>
    </div>
  `;
}

function providerCard(item) {
  return `
    <div class="list-card">
      <strong>${item.provider || item.name || 'Provider'}</strong><br>
      <span class="muted">Enabled: ${item.enabled !== false ? 'Yes' : 'No'}</span><br>
      <span class="muted">Client ID: ${item.clientId || '-'}</span><br>
      <span class="muted">Updated: ${item.updatedAt || item.createdAt || ''}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(item.enabled !== false ? 'enabled' : 'disabled')}
      </div>
    </div>
  `;
}

async function loadAuthSecurity() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SECURITY',
    title: 'Auth + Session Security Console',
    subtitle: 'Inspect session security, auth providers, and current account session activity'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Security Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-auth-security-btn" class="primary-btn" type="button">Refresh</button>
        <button id="revoke-current-session-btn" class="ghost-btn" type="button">Revoke Current</button>
        <button id="revoke-all-sessions-btn" class="danger-btn" type="button">Revoke All</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-auth-security-btn').onclick = () => loadAuthSecurity();

  document.getElementById('revoke-current-session-btn').onclick = async () => {
    try {
      const res = await apiFetch('/api/auth-security/sessions/revoke-current', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      USGIOSAlert.show({ title: 'Session', message: data.message || 'Current session revoked' });
      loadAuthSecurity();
    } catch (error) {
      USGIOSAlert.show({ title: 'Security Error', message: error.message, type: 'error' });
    }
  };

  document.getElementById('revoke-all-sessions-btn').onclick = async () => {
    try {
      const res = await apiFetch('/api/auth-security/sessions/revoke-all', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      USGIOSAlert.show({ title: 'Sessions', message: data.message || 'All sessions revoked' });
      loadAuthSecurity();
    } catch (error) {
      USGIOSAlert.show({ title: 'Security Error', message: error.message, type: 'error' });
    }
  };

  try {
    const [summaryRes, sessionsRes, providersRes] = await Promise.all([
      apiFetch('/api/auth-security/summary'),
      apiFetch('/api/auth-security/sessions'),
      apiFetch('/api/auth-security/providers')
    ]);

    const summaryData = await summaryRes.json();
    const sessionsData = await sessionsRes.json();
    const providersData = await providersRes.json();

    const summary = summaryData.summary || {};
    const sessions = sessionsData.sessions || [];
    const providers = providersData.providers || [];

    content.innerHTML += `
      <div class="grid-4">
        ${metricCard('Total Sessions', summary.totalSessions || 0, 'All sessions')}
        ${metricCard('Active Sessions', summary.activeSessions || 0, 'Currently active')}
        ${metricCard('My Sessions', summary.mySessions || 0, 'Your account sessions')}
        ${metricCard('Providers', summary.providerCount || 0, 'Configured auth providers')}
      </div>
    `;

    const sessionsWrap = document.createElement('section');
    sessionsWrap.className = 'card';
    sessionsWrap.style.marginTop = '18px';
    sessionsWrap.innerHTML = `
      <div class="kicker">SESSIONS</div>
      <h2>My Session Activity</h2>
      ${sessions.length ? sessions.map(sessionCard).join('') : '<div class="muted">No sessions found.</div>'}
    `;
    content.appendChild(sessionsWrap);

    const providersWrap = document.createElement('section');
    providersWrap.className = 'card';
    providersWrap.style.marginTop = '18px';
    providersWrap.innerHTML = `
      <div class="kicker">AUTH PROVIDERS</div>
      <h2>Configured Providers</h2>
      ${providers.length ? providers.map(providerCard).join('') : '<div class="muted">No auth providers found.</div>'}
    `;
    content.appendChild(providersWrap);
  } catch (error) {
    USGIOSAlert.show({ title: 'Auth Security Error', message: error.message, type: 'error' });
  }
}

loadAuthSecurity();
