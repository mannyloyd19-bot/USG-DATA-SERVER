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
      <h2>${value}</h2>
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

  const skeleton = window.USGPremiumUI?.addSkeleton(content, 4);

  const [dash, readiness, analytics, polish] = await Promise.all([
    safeJson('/api/dashboard'),
    safeJson('/api/live-readiness/status'),
    safeJson('/api/platform-analytics/summary'),
    safeJson('/api/final-polish/summary')
  ]);

  if (skeleton) skeleton.remove();

  const stats = dash.stats || {};
  const summary = analytics.summary || {};
  const charts = analytics.charts || {};
  const app = polish.app || {};
  const readinessPercent = readiness.readinessPercent || 0;

  content.innerHTML += `
    <div class="grid-4">
      ${card('Users', stats.users || 0, 'Registered accounts')}
      ${card('Collections', stats.collections || 0, 'Data structures')}
      ${card('Files', stats.files || 0, 'Stored assets')}
      ${card('Readiness', readinessPercent + '%', 'System readiness')}
    </div>

    <div class="grid-3">
      <section class="card">
        <div class="kicker">SYSTEM</div>
        <h2>Runtime</h2>
        <div class="actions">${USGPageKit.statusBadge('online')}</div>
        <div class="muted" style="margin-top:10px">
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
        <div class="actions" style="margin-top:10px;flex-wrap:wrap">
          <a href="/pages/domains.html" class="ghost-btn">Domain Center</a>
          <a href="/pages/ssl-center.html" class="ghost-btn">SSL Center</a>
        </div>
      </section>

      <section class="card">
        <div class="kicker">OPERATIONS</div>
        <h2>Quick Actions</h2>
        <div class="actions" style="flex-wrap:wrap">
          <a href="/pages/boot-diagnostics.html" class="ghost-btn">Boot Diagnostics</a>
          <a href="/pages/install-wizard.html" class="ghost-btn">Install Wizard</a>
          <a href="/pages/backup-restore.html" class="ghost-btn">Restore</a>
          <a href="/pages/env-manager.html" class="primary-btn">Env Manager</a>
        </div>
      </section>
    </div>

    <div class="grid-3">
      ${window.USGRealCharts.chartCard('REQUESTS', 'Traffic Trend', charts.requests || [12,18,17,26,31,28,36])}
      ${window.USGRealCharts.chartCard('ERRORS', 'Error Trend', charts.errors || [1,0,2,1,1,0,1])}
      ${window.USGRealCharts.chartCard('BACKUPS', 'Backup Activity', charts.backups || [0,1,0,1,1,1,0,1])}
    </div>
  `;

  window.USGPremiumUI?.pulseButton('.primary-btn');
}

loadDashboard();
