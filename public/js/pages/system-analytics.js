window.__DISABLE_HEALTH_BANNER__ = true;
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

function metricCard(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title.toUpperCase()}</div>
      <h2>${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

async function loadSystemAnalytics() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SYSTEM ANALYTICS',
    title: 'System Analytics',
    subtitle: 'Platform metrics, traffic, and infrastructure insights'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Analytics Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-system-analytics-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-system-analytics-btn').onclick = () => loadSystemAnalytics();

  const data = await safeJson('/api/platform-analytics/summary');
  const summary = data.summary || {};
  const charts = data.charts || {};

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="grid-4">
      ${metricCard('Requests', summary.requests || 0, 'Platform requests')}
      ${metricCard('Errors', summary.errors || 0, 'System failures')}
      ${metricCard('Domains', summary.domains || 0, 'Registered domains')}
      ${metricCard('API Keys', summary.apiKeys || 0, 'Access keys')}
    </div>

    <div class="grid-3">
      <section class="card">
        <div class="kicker">REQUEST TREND</div>
        <h2>Requests</h2>
        <div class="muted">${JSON.stringify(charts.requests || [])}</div>
      </section>
      <section class="card">
        <div class="kicker">ERROR TREND</div>
        <h2>Errors</h2>
        <div class="muted">${JSON.stringify(charts.errors || [])}</div>
      </section>
      <section class="card">
        <div class="kicker">BACKUP TREND</div>
        <h2>Backups</h2>
        <div class="muted">${JSON.stringify(charts.backups || [])}</div>
      </section>
    </div>
  `;
  content.appendChild(wrap);
}
loadSystemAnalytics();
