window.__DISABLE_HEALTH_BANNER__ = false;

requireAuth();
USGShell.buildShell();

function metricCard(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title}</div>
      <h2 style="margin:8px 0 6px">${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

function activityCard(item) {
  return `
    <div class="list-card">
      <strong>${item.title || 'Activity'}</strong><br>
      <span class="muted">${item.type || ''}</span><br>
      <span class="muted">${item.subtitle || ''}</span><br>
      <span class="muted">${item.createdAt || ''}</span>
    </div>
  `;
}

async function safeJson(url) {
  const res = await apiFetch(url);
  return await res.json();
}

async function renderDashboard() {
  const content = document.getElementById('page-content');
  if (!content) {
    setTimeout(renderDashboard, 100);
    return;
  }

  content.innerHTML = '<section class="card"><div class="muted">Loading dashboard...</div></section>';

  try {
    const data = await safeJson('/api/dashboard');

    if (!data.success) {
      throw new Error(data.message || 'Failed to load dashboard');
    }

    const summary = data.summary || {};
    const charts = data.charts || {};
    const activity = data.recentActivity || [];
    const app = data.app || {};

    USGPageKit.setPageHeader({
      kicker: 'OVERVIEW',
      title: 'Dashboard',
      subtitle: `Environment: ${app.environment || 'development'} · Database: ${app.dbPath || './database.sqlite'}`
    });

    content.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
        ${metricCard('Users', summary.usersTotal || 0, 'Platform accounts')}
        ${metricCard('Tenants', summary.tenantsTotal || 0, 'Workspaces')}
        ${metricCard('Collections', summary.collectionsTotal || 0, 'Data structures')}
        ${metricCard('Records', summary.recordsTotal || 0, 'Stored rows')}
        ${metricCard('Files', summary.filesTotal || 0, 'Uploaded assets')}
        ${metricCard('Backups', summary.backupsTotal || 0, 'Snapshots')}
        ${metricCard('Webhooks', summary.webhooksTotal || 0, 'Registered hooks')}
        ${metricCard('Payments', summary.paymentsTotal || 0, 'Transactions')}
        ${metricCard('Invoices', summary.invoicesTotal || 0, 'Issued invoices')}
      </div>

      <section class="card" style="margin-top:20px">
        <div class="kicker">TRENDS</div>
        <h2>Last 7 Days</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
          ${window.USGRealCharts ? window.USGRealCharts.chartCard('USERS', 'User Growth', charts.users || [0,0,0,0,0,0,0]) : ''}
          ${window.USGRealCharts ? window.USGRealCharts.chartCard('RECORDS', 'Record Growth', charts.records || [0,0,0,0,0,0,0]) : ''}
          ${window.USGRealCharts ? window.USGRealCharts.chartCard('FILES', 'File Activity', charts.files || [0,0,0,0,0,0,0]) : ''}
          ${window.USGRealCharts ? window.USGRealCharts.chartCard('PAYMENTS', 'Payment Activity', charts.payments || [0,0,0,0,0,0,0]) : ''}
          ${window.USGRealCharts ? window.USGRealCharts.chartCard('BACKUPS', 'Backup Activity', charts.backups || [0,0,0,0,0,0,0]) : ''}
          ${window.USGRealCharts ? window.USGRealCharts.chartCard('WEBHOOKS', 'Webhook Activity', charts.webhooks || [0,0,0,0,0,0,0]) : ''}
        </div>
      </section>

      <section class="card" style="margin-top:20px">
        <div class="kicker">RECENT</div>
        <h2>Recent Activity</h2>
        ${activity.length ? activity.map(activityCard).join('') : '<div class="muted">No recent activity found.</div>'}
      </section>
    `;
  } catch (error) {
    content.innerHTML = `<section class="card"><div class="muted">Dashboard error: ${error.message}</div></section>`;
  }
}

renderDashboard();
