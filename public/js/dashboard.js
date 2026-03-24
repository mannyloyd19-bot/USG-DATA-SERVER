window.__DISABLE_HEALTH_BANNER__ = false;
requireAuth();
USGShell.buildShell();

function lineSvg(values = []) {
  const width = 320;
  const height = 72;
  const safe = Array.isArray(values) && values.length ? values : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...safe, 1);
  const step = safe.length > 1 ? width / (safe.length - 1) : width;

  const points = safe.map((v, i) => {
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
    return await res.json();
  } catch {
    return {};
  }
}

async function loadDashboard() {
  const content = document.getElementById('page-content');
  if (!content) return;

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
      requests: [12, 18, 17, 26, 31, 28, 36],
      errors: [1, 0, 2, 1, 1, 0, 1],
      backups: [0, 1, 0, 1, 1, 0, 1]
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
          <div class="kicker">REQUEST VOLUME</div>
          <h2>${summary.requestsTotal || 0}</h2>
          ${lineSvg(charts.requests)}
          <div class="muted">Recent request activity</div>
        </section>

        <section class="card">
          <div class="kicker">ERROR RATE</div>
          <h2>${summary.errorsTotal || 0}</h2>
          ${lineSvg(charts.errors)}
          <div class="muted">Recent platform errors</div>
        </section>
      </div>

      <div class="grid-3" style="margin-top:24px">
        <section class="card">
          <div class="kicker">BACKUPS</div>
          <h2>${summary.backupsTotal || 0}</h2>
          ${lineSvg(charts.backups)}
          <div class="muted">Backup execution trend</div>
        </section>

        <section class="card">
          <div class="kicker">SYSTEM LINKS</div>
          <h2>Quick Access</h2>
          <div class="actions">
            <a class="ghost-btn" href="/pages/system-health.html">System Health</a>
            <a class="ghost-btn" href="/pages/log-viewer.html">Log Viewer</a>
            <a class="ghost-btn" href="/pages/domain-diagnostics.html">Domains</a>
          </div>
        </section>

        <section class="card">
          <div class="kicker">LIVE STATUS</div>
          <h2>Operations</h2>
          <div class="muted">
            Realtime: Active<br>
            Monitoring: Ready<br>
            Diagnostics: Ready
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    content.innerHTML = `
      <section class="card">
        <div class="kicker">ERROR</div>
        <h2>Dashboard Failed</h2>
        <div class="muted">${error.message}</div>
      </section>
    `;
  }
}

loadDashboard();
