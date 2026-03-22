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

async function loadSettings() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SETTINGS',
    title: 'System Settings',
    subtitle: 'Manage platform configuration, environment, and security preferences'
  });

  const actionWrap = document.createElement('section');
  actionWrap.className = 'card';
  actionWrap.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Settings Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-settings-btn" class="ghost-btn" type="button">Refresh</button>
        <a href="/pages/env-manager.html" class="ghost-btn">Env Manager</a>
        <a href="/pages/boot-diagnostics.html" class="ghost-btn">Diagnostics</a>
      </div>
    </div>
  `;
  content.appendChild(actionWrap);

  document.getElementById('refresh-settings-btn').onclick = () => loadSettings();

  const [settingsData, healthData, polishData] = await Promise.all([
    safeJson('/api/settings'),
    safeJson('/health/details'),
    safeJson('/api/final-polish/summary')
  ]);

  const rows = Array.isArray(settingsData) ? settingsData : (settingsData.settings || settingsData.data || []);
  const health = healthData.data || {};
  const app = polishData.app || {};

  const metrics = document.createElement('div');
  metrics.innerHTML = `
    <div class="grid-4">
      ${metricCard('Environment', app.env || 'development', 'Runtime mode')}
      ${metricCard('Database', app.dbPath || './database.sqlite', 'Storage path')}
      ${metricCard('JWT', health.jwtConfigured ? 'Ready' : 'Missing', 'Authentication secret')}
      ${metricCard('Security', health.helmetEnabled ? 'Enabled' : 'Disabled', 'Helmet protection')}
    </div>
  `;
  content.appendChild(metrics);

  const grouped = document.createElement('div');
  grouped.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">APPLICATION</div>
        <h2>Runtime Configuration</h2>
        <div class="muted">
          Environment: ${health.environment || app.env || 'development'}<br>
          Database: ${health.database || 'sqlite'}<br>
          Installer Enabled: ${String(health.installerEnabled)}<br>
          Release Lockdown: ${String(health.releaseLockdown)}
        </div>
      </section>

      <section class="card">
        <div class="kicker">SECURITY</div>
        <h2>Protection Summary</h2>
        <div class="muted">
          JWT Configured: ${String(health.jwtConfigured)}<br>
          CORS Enabled: ${String(health.corsEnabled)}<br>
          Helmet Enabled: ${String(health.helmetEnabled)}
        </div>
      </section>
    </div>
  `;
  content.appendChild(grouped);

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search settings...' });
  content.appendChild(searchWrap);

  const listWrap = document.createElement('section');
  listWrap.innerHTML = rows.length ? rows.map(item => `
    <div class="list-card">
      <strong>${item.label || item.key}</strong><br>
      <span class="muted">${item.key}</span><br>
      <span>${typeof item.value === 'object' ? JSON.stringify(item.value) : (item.value ?? '')}</span>
    </div>
  `).join('') : USGPageKit.emptyState({ title: 'No settings found' });

  content.appendChild(listWrap);
  USGPageKit.attachBasicSearch({});
}
loadSettings();
