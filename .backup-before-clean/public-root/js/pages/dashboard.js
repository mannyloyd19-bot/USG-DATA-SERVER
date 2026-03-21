requireAuth();
USGShell.buildShell();

async function loadDashboard() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SYSTEM',
    title: 'Dashboard',
    subtitle: 'Overview of platform health, usage, and live readiness'
  });

  content.innerHTML += USGPageKit.loadingState({ label: 'Loading dashboard...' });

  try {
    const [dashRes, readinessRes, polishRes] = await Promise.all([
      apiFetch('/api/dashboard').catch(() => null),
      apiFetch('/api/live-readiness/status').catch(() => null),
      apiFetch('/api/final-polish/summary').catch(() => null)
    ]);

    let dashData = {};
    let readinessData = {};
    let polishData = {};

    if (dashRes) { try { dashData = await dashRes.json(); } catch {} }
    if (readinessRes) { try { readinessData = await readinessRes.json(); } catch {} }
    if (polishRes) { try { polishData = await polishRes.json(); } catch {} }

    const stats = dashData.stats || {};
    const readiness = readinessData.readinessPercent || 0;
    const app = polishData.app || {};

    content.innerHTML = `
      <section class="hero card">
        <div class="kicker">SYSTEM</div>
        <div class="usg-page-head-row">
          <div>
            <h1 class="usg-page-title">Dashboard</h1>
            <div class="muted usg-page-subtitle">Overview of platform health, usage, and live readiness</div>
          </div>
          <div class="actions">
            <a href="/pages/live-readiness.html" class="ghost-btn">Live Readiness</a>
            <a href="/pages/boot-diagnostics.html" class="primary-btn">Boot Diagnostics</a>
          </div>
        </div>
      </section>

      <div class="grid-4" style="margin-top:18px">
        ${USGPageKit.infoCard('Users', stats.users || 0)}
        ${USGPageKit.infoCard('Collections', stats.collections || 0)}
        ${USGPageKit.infoCard('Files', stats.files || 0)}
        ${USGPageKit.infoCard('Readiness', `${readiness}%`)}
      </div>

      <div class="grid-3" style="margin-top:24px">
        <section class="card">
          <div class="kicker">SYSTEM STATUS</div>
          <h2>Platform</h2>
          <div class="actions">${USGPageKit.statusBadge('online')}</div>
          <div class="muted" style="margin-top:12px">
            Environment: ${app.env || 'development'}<br>
            Version: ${app.version || '1.0.0'}<br>
            Database: ${app.dbPath || './database.sqlite'}
          </div>
        </section>

        <section class="card">
          <div class="kicker">QUICK ACCESS</div>
          <h2>Core Panels</h2>
          <div class="actions" style="flex-wrap:wrap">
            <a href="/pages/domains.html" class="ghost-btn">Domains</a>
            <a href="/pages/system-analytics.html" class="ghost-btn">Analytics</a>
            <a href="/pages/backup-system.html" class="ghost-btn">Backups</a>
            <a href="/pages/env-manager.html" class="ghost-btn">Env Manager</a>
          </div>
        </section>

        <section class="card">
          <div class="kicker">HEALTH</div>
          <h2>Current Readiness</h2>
          <div class="muted">Your current install readiness is <strong>${readiness}%</strong>.</div>
          <div style="margin-top:12px">${USGPageKit.statusBadge(readiness >= 90 ? 'ready' : readiness >= 70 ? 'partial' : 'attention')}</div>
        </section>
      </div>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Dashboard Error', message: err.message, type: 'error' });
  }
}

loadDashboard();
