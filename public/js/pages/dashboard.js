window.__DISABLE_HEALTH_BANNER__ = false;
requireAuth();
USGShell.buildShell();

async function safeJson(url) {
  try {
    const res = await apiFetch(url);
    return await res.json();
  } catch {
    return {};
  }
}

function card(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title.toUpperCase()}</div>
      <h2 style="margin:8px 0 6px">${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

async function loadDashboard() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'CONTROL CENTER',
    title: 'USG Operations Dashboard',
    subtitle: 'Platform overview, activity, and quick actions'
  });

  const [dash, readiness, analytics, polish] = await Promise.all([
    safeJson('/api/dashboard'),
    safeJson('/api/live-readiness/status'),
    safeJson('/api/platform-analytics/summary'),
    safeJson('/api/final-polish/summary')
  ]);

  const stats = dash.stats || {};
  const summary = analytics.summary || {};
  const app = polish.app || {};
  const readinessPercent = readiness.readinessPercent || 0;

  content.innerHTML = `
    <div class="grid-4" style="margin-top:18px">
      ${card('Users', stats.users || 0, 'Registered accounts')}
      ${card('Collections', stats.collections || 0, 'Data structures')}
      ${card('Files', stats.files || 0, 'Stored assets')}
      ${card('Readiness', readinessPercent + '%', 'System readiness')}
    </div>

    <div class="grid-3" style="margin-top:18px">
      <section class="card">
        <div class="kicker">SYSTEM</div>
        <h2>Runtime</h2>
        <div class="actions">${USGPageKit.statusBadge('online')}</div>
        <div class="muted" style="margin-top:12px">
          Environment: ${app.env || 'development'}<br>
          Version: ${app.version || '1.0.0'}<br>
          Database: ${app.dbPath || './database.sqlite'}
        </div>
      </section>

      <section class="card">
        <div class="kicker">NETWORK</div>
        <h2>Gateway</h2>
        <div class="muted">
          Public Domain: ${app.duckdnsDomain || 'not configured'}<br>
          Domains: ${summary.domains || 0}<br>
          API Keys: ${summary.apiKeys || 0}
        </div>
        <div class="actions" style="margin-top:12px;flex-wrap:wrap">
          <a href="/pages/domains.html" class="ghost-btn">Domains</a>
          <a href="/pages/ssl-center.html" class="ghost-btn">SSL Center</a>
          <a href="/pages/env-manager.html" class="ghost-btn">Env</a>
        </div>
      </section>

      <section class="card">
        <div class="kicker">QUICK ACTIONS</div>
        <h2>Operations</h2>
        <div class="actions" style="flex-wrap:wrap">
          <a href="/pages/users.html" class="ghost-btn">Users</a>
          <a href="/pages/collections.html" class="ghost-btn">Collections</a>
          <a href="/pages/files.html" class="ghost-btn">Files</a>
          <a href="/pages/tenants.html" class="primary-btn">Tenants</a>
        </div>
      </section>
    </div>

    <div class="grid-2" style="margin-top:18px">
      <section class="card">
        <div class="kicker">RECENT MODULES</div>
        <h2>Core Navigation</h2>
        <div class="actions" style="flex-wrap:wrap">
          <a href="/pages/boot-diagnostics.html" class="ghost-btn">Boot Diagnostics</a>
          <a href="/pages/install-wizard.html" class="ghost-btn">Install Wizard</a>
          <a href="/pages/backup-restore.html" class="ghost-btn">Restore</a>
          <a href="/pages/system-analytics.html" class="ghost-btn">Analytics</a>
        </div>
      </section>

      <section class="card">
        <div class="kicker">STATUS</div>
        <h2>Platform State</h2>
        <div class="muted">
          Current readiness is <strong>${readinessPercent}%</strong>.<br>
          Keep backups, domains, SSL, and environment settings aligned before production release.
        </div>
      </section>
    </div>
  `;
}

loadDashboard();
