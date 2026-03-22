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
      <h2 style="margin:8px 0 6px">${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

async function loadEnterpriseDb() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'ENTERPRISE DB',
    title: 'Enterprise DB',
    subtitle: 'Database status, schema health, and storage overview'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Database Controls</h2>
      </div>
      <div class="actions">
        <a href="/pages/db-migration.html" class="ghost-btn">Migrations</a>
        <a href="/pages/backup-system.html" class="ghost-btn">Backups</a>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  const data = await safeJson('/api/enterprise-db/summary');
  const summary = data.summary || data.data || {};

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="grid-4" style="margin-top:18px">
      ${metricCard('Collections', summary.collections || 0, 'Registered collections')}
      ${metricCard('Indexes', summary.indexes || 0, 'Database indexes')}
      ${metricCard('Records', summary.records || 0, 'Stored records')}
      ${metricCard('Backups', summary.backups || 0, 'Available backups')}
    </div>

    <div class="grid-2" style="margin-top:18px">
      <section class="card">
        <div class="kicker">STORAGE</div>
        <h2>Database Overview</h2>
        <div class="muted">
          Engine: ${summary.engine || 'sqlite'}<br>
          Size: ${summary.size || 'unknown'}<br>
          Status: ${summary.status || 'ready'}
        </div>
      </section>

      <section class="card">
        <div class="kicker">HEALTH</div>
        <h2>Schema Status</h2>
        <div class="muted">
          Tables: ${summary.tables || 0}<br>
          Pending Migrations: ${summary.pendingMigrations || 0}<br>
          Integrity: ${summary.integrity || 'ok'}
        </div>
      </section>
    </div>
  `;
  content.appendChild(wrap);
}
loadEnterpriseDb();
