requireAuth();
USGShell.buildShell();

function formatNumber(v) {
  return Number(v || 0).toLocaleString();
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((Number(part || 0) / Number(total || 1)) * 100);
}

async function loadSystemAnalytics() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="card">
      <div class="kicker">SYSTEM ANALYTICS</div>
      <h2>Platform Overview</h2>
      <div class="grid-3" id="sys-top-stats" style="margin-top:16px"></div>
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">MODULE DISTRIBUTION</div>
        <h2>Usage Summary</h2>
        <div id="sys-bars">Loading...</div>
      </section>

      <section class="card">
        <div class="kicker">SYSTEM HEALTH</div>
        <h2>Runtime Snapshot</h2>
        <div id="sys-health-cards">Loading...</div>
      </section>
    </div>

    <section class="card">
      <div class="kicker">RAW ANALYTICS</div>
      <h2>Analytics JSON</h2>
      <pre id="sys-analytics-json">Loading...</pre>
    </section>
  `;

  try {
    const [statsRes, healthRes] = await Promise.all([
      apiFetch('/api/dashboard/stats'),
      fetch('/health/details')
    ]);

    const stats = await statsRes.json();
    const health = await healthRes.json();

    const data = stats?.data || {};
    const healthData = health?.data || {};

    const users = Number(data.users || 0);
    const collections = Number(data.collections || 0);
    const records = Number(data.records || 0);
    const files = Number(data.files || 0);
    const tables = Number(data.tables || 0);
    const relations = Number(data.relationships || 0);

    const totalObjects = users + collections + records + files + tables + relations;

    document.getElementById('sys-top-stats').innerHTML = `
      <div class="info-card">
        <div class="info-title">Total Managed Objects</div>
        <div class="info-value">${formatNumber(totalObjects)}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Records</div>
        <div class="info-value">${formatNumber(records)}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Files</div>
        <div class="info-value">${formatNumber(files)}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Users</div>
        <div class="info-value">${formatNumber(users)}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Relational Tables</div>
        <div class="info-value">${formatNumber(tables)}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Relationships</div>
        <div class="info-value">${formatNumber(relations)}</div>
      </div>
    `;

    const bars = [
      ['Users', users],
      ['Collections', collections],
      ['Records', records],
      ['Files', files],
      ['Tables', tables],
      ['Relations', relations]
    ];
    const max = Math.max(...bars.map(x => x[1]), 1);

    document.getElementById('sys-bars').innerHTML = bars.map(([label, value]) => `
      <div class="bar-row">
        <div>${label}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(value / max) * 100}%"></div>
        </div>
        <div class="bar-value">${formatNumber(value)}</div>
      </div>
    `).join('');

    document.getElementById('sys-health-cards').innerHTML = `
      <div class="list-card">
        <strong>Environment</strong><br>
        <span class="muted">${healthData.environment || 'unknown'}</span>
      </div>
      <div class="list-card">
        <strong>Database</strong><br>
        <span class="muted">${healthData.database || 'unknown'}</span>
      </div>
      <div class="list-card">
        <strong>JWT Configured</strong><br>
        <span class="muted">${String(healthData.jwtConfigured ?? false)}</span>
      </div>
      <div class="list-card">
        <strong>Release Lockdown</strong><br>
        <span class="muted">${String(healthData.releaseLockdown ?? false)}</span>
      </div>
      <div class="list-card">
        <strong>Installer Enabled</strong><br>
        <span class="muted">${String(healthData.installerEnabled ?? false)}</span>
      </div>
      <div class="list-card">
        <strong>Security Coverage</strong><br>
        <span class="muted">${percent(
          [healthData.jwtConfigured, !healthData.installerEnabled, healthData.releaseLockdown].filter(Boolean).length,
          3
        )}% baseline</span>
      </div>
    `;

    document.getElementById('sys-analytics-json').textContent = JSON.stringify({
      stats: data,
      health: healthData,
      derived: {
        totalObjects,
        recordSharePercent: percent(records, totalObjects),
        fileSharePercent: percent(files, totalObjects),
        userSharePercent: percent(users, totalObjects)
      }
    }, null, 2);

    USGShell.setupRawToggles(content);
  } catch (error) {
    document.getElementById('sys-analytics-json').textContent = JSON.stringify({
      error: error.message
    }, null, 2);
    USGShell.setupRawToggles(content);
  }
}

loadSystemAnalytics();
