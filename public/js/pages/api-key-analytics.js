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

async function loadApiKeyAnalytics() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'API ANALYTICS',
    title: 'API Key Analytics',
    subtitle: 'Usage volume, routes, and access trends'
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
        <button id="refresh-key-analytics-btn" class="ghost-btn" type="button">Refresh</button>
        <a href="/pages/api-keys.html" class="ghost-btn">Keys</a>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-key-analytics-btn').onclick = () => loadApiKeyAnalytics();

  const data = await safeJson('/api/api-key-analytics');
  const summary = data.summary || {};
  const topRoutes = data.topRoutes || data.routes || [];
  const topKeys = data.topKeys || data.keys || [];

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="grid-4">
      ${metricCard('Requests', summary.requests || 0, 'Tracked calls')}
      ${metricCard('Failures', summary.failures || 0, 'Rejected/failed calls')}
      ${metricCard('Keys', summary.keys || 0, 'Tracked API keys')}
      ${metricCard('Routes', summary.routes || 0, 'Active endpoints')}
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">TOP ROUTES</div>
        <h2>Most Used Routes</h2>
        ${
          topRoutes.length
            ? topRoutes.map(r => `<div class="list-card"><strong>${r.route || r.path || '-'}</strong><br><span class="muted">Requests: ${r.count || 0}</span></div>`).join('')
            : `<div class="muted">No route analytics found.</div>`
        }
      </section>

      <section class="card">
        <div class="kicker">TOP KEYS</div>
        <h2>Most Active Keys</h2>
        ${
          topKeys.length
            ? topKeys.map(k => `<div class="list-card"><strong>${k.name || k.keyName || '-'}</strong><br><span class="muted">Requests: ${k.count || 0}</span></div>`).join('')
            : `<div class="muted">No key analytics found.</div>`
        }
      </section>
    </div>
  `;
  content.appendChild(wrap);
}
loadApiKeyAnalytics();
