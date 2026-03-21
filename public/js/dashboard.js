requireAuth();
USGShell.buildShell();

function lineSvg(values = []) {
  const width = 320, height = 72;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 12) - 6;
    return `${x},${y}`;
  }).join(' ');
  return `
    <div class="mini-line">
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <polyline fill="none" stroke="currentColor" stroke-width="3" points="${points}" />
      </svg>
    </div>
  `;
}

async function safeJson(url) {
  try {
    const res = await apiFetch(url);
    const data = await res.json();
    return data;
  } catch {
    return {};
  }
}

async function loadDashboard() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'CONTROL CENTER',
    title: 'USG Operations Dashboard',
    subtitle: 'Platform health, service status, domain access, and system readiness'
  });

  try {
    const [dash, readiness, polish, analytics] = await Promise.all([
      safeJson('/api/dashboard'),
      safeJson('/api/live-readiness/status'),
      safeJson('/api/final-polish/summary'),
      safeJson('/api/platform-analytics/summary')
    ]);

    const stats = dash.stats || {};
    const app = polish.app || {};
    const readinessPercent = readiness.readinessPercent || 0;
    const summary = analytics.summary || {};
    const charts = analytics.charts || {
      requests: [12,18,17,26,31,28,36],
      errors: [1,0,2,1,1,0,1],
      backups: [0,1,0,1,1,0,1]
    };

    content.innerHTML = `
      <div class="grid-4">
        ${USGPageKit.infoCard('Users', stats.users || 0, 'Registered accounts')}
        ${USGPageKit.infoCard('Collections', stats.collections || 0, 'Data structures')}
        ${USGPageKit.infoCard('Files', stats.files || 0, 'Stored assets')}
        ${USGPageKit.infoCard('Readiness', `${readinessPercent}%`, 'Install health')}
      </div>

      <div class="grid-3" style="margin-top:24px">
        <section class="card">
          <div class="kicker">PLATFORM STATUS</div>
          <h2>Runtime</h2>
          <div class="actions">${USGPageKit.statusBadge('online')}</div>
          <div class="muted" style="margin-top:12px">
            Environment: ${app.env || 'development'}<br>
            Version: ${app.version || '1.0.0'}<br>
            Database: ${app.dbPath || './database.sqlite'}
          </div>
        </section>

        <section class="card">
          <div class="kicker">NETWORK ACCESS</div>
          <h2>Gateway</h2>
          <div class="muted">
            Public Domain: ${app.duckdnsDomain || 'not configured'}<br>
            Domains: ${summary.domains || 0}<br>
            API Keys: ${summary.apiKeys || 0}
          </div>
          <div class="actions" style="margin-top:12px;flex-wrap:wrap">
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

      <div class="grid-3" style="margin-top:24px">
        <section class="card">
          <div class="kicker">REQUESTS</div>
          <h2>Traffic Trend</h2>
          ${lineSvg(charts.requests || [])}
        </section>

        <section class="card">
          <div class="kicker">ERRORS</div>
          <h2>Error Trend</h2>
          ${lineSvg(charts.errors || [])}
        </section>

        <section class="card">
          <div class="kicker">BACKUPS</div>
          <h2>Backup Activity</h2>
          ${lineSvg(charts.backups || [])}
        </section>
      </div>
    `;
  } catch (err) {
    if (window.USGIOSAlert) {
      USGIOSAlert.show({ title: 'Dashboard Error', message: err.message, type: 'error' });
    }
  }
}

loadDashboard();
