window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function metricCard(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title.toUpperCase()}</div>
      <h2>${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

function eventCard(evt) {
  return `
    <div class="list-card">
      <strong>${evt.type || 'event'}</strong><br>
      <span class="muted">Module: ${evt.module || '-'}</span><br>
      <span class="muted">Action: ${evt.action || '-'}</span><br>
      <span class="muted">Record: ${evt.recordId || '-'}</span><br>
      <span class="muted">${evt.emittedAt || ''}</span>
    </div>
  `;
}

async function loadSystemHealth() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'MONITORING',
    title: 'System Health Dashboard',
    subtitle: 'Runtime health, service status, database connectivity, and recent system activity'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Monitoring Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-system-health-btn" class="primary-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-system-health-btn').onclick = () => loadSystemHealth();

  try {
    const res = await apiFetch('/api/system-monitoring/metrics');
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to load system metrics');
    }

    const runtime = data.runtime || {};
    const counts = data.counts || {};
    const memory = runtime.memory || {};
    const services = data.services || {};
    const db = services.database || {};
    const events = data.events || [];

    content.innerHTML += `
      <div class="grid-4">
        ${metricCard('Uptime', `${runtime.uptimeSeconds || 0}s`, 'Process uptime')}
        ${metricCard('DB Status', db.status || 'unknown', 'Database connectivity')}
        ${metricCard('Heap Used', `${memory.heapUsedMb || 0} MB`, 'Node memory usage')}
        ${metricCard('CPU Count', runtime.cpuCount || 0, 'System processors')}
      </div>

      <div class="grid-4">
        ${metricCard('Users', counts.users || 0, 'Registered accounts')}
        ${metricCard('Collections', counts.collections || 0, 'Data collections')}
        ${metricCard('Domains', counts.domains || 0, 'Domain registry')}
        ${metricCard('Files', counts.files || 0, 'Stored files')}
      </div>

      <div class="grid-3">
        ${metricCard('API Keys', counts.apiKeys || 0, 'Access keys')}
        ${metricCard('Node', runtime.nodeVersion || '-', 'Runtime version')}
        ${metricCard('Platform', runtime.platform || '-', runtime.arch || '')}
      </div>
    `;

    const details = document.createElement('section');
    details.className = 'card';
    details.style.marginTop = '18px';
    details.innerHTML = `
      <div class="kicker">RUNTIME DETAILS</div>
      <h2>System Summary</h2>
      <div class="muted">
        Hostname: ${runtime.hostname || '-'}<br>
        RSS Memory: ${memory.rssMb || 0} MB<br>
        Heap Total: ${memory.heapTotalMb || 0} MB<br>
        External Memory: ${memory.externalMb || 0} MB<br>
        Total System Memory: ${runtime.system?.totalMemMb || 0} MB<br>
        Free System Memory: ${runtime.system?.freeMemMb || 0} MB<br>
        Load Average: ${(runtime.loadAverage || []).join(', ') || '-'}
      </div>
    `;
    content.appendChild(details);

    const eventsWrap = document.createElement('section');
    eventsWrap.className = 'card';
    eventsWrap.style.marginTop = '18px';
    eventsWrap.innerHTML = `
      <div class="kicker">RECENT EVENTS</div>
      <h2>Recent Platform Activity</h2>
      ${events.length ? events.map(eventCard).join('') : '<div class="muted">No recent events.</div>'}
    `;
    content.appendChild(eventsWrap);

  } catch (error) {
    USGIOSAlert.show({
      title: 'Monitoring Error',
      message: error.message,
      type: 'error'
    });
  }
}

loadSystemHealth();
