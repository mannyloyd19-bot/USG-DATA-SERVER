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

async function loadDiagnosticsConsole() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DIAGNOSTICS',
    title: 'Diagnostics Console',
    subtitle: 'Inspect runtime state, database health, and internal process details'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Diagnostics Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-diagnostics-btn" class="primary-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-diagnostics-btn').onclick = () => loadDiagnosticsConsole();

  try {
    const res = await apiFetch('/api/diagnostics/console');
    const data = await res.json();
    const d = data.diagnostics || {};
    const proc = d.process || {};
    const mem = d.memory || {};
    const sys = d.system || {};
    const db = d.database || {};
    const logs = d.logs || [];

    content.innerHTML += `
      <div class="grid-4">
        ${metricCard('PID', proc.pid || '-', 'Process id')}
        ${metricCard('Uptime', `${proc.uptimeSeconds || 0}s`, 'Runtime uptime')}
        ${metricCard('DB', db.status || '-', 'Database health')}
        ${metricCard('CPU', sys.cpuCount || 0, 'Processors')}
      </div>

      <div class="grid-4">
        ${metricCard('Heap Used', `${mem.heapUsedMb || 0} MB`, 'Node heap used')}
        ${metricCard('Heap Total', `${mem.heapTotalMb || 0} MB`, 'Node heap total')}
        ${metricCard('RSS', `${mem.rssMb || 0} MB`, 'Resident memory')}
        ${metricCard('Free Mem', `${sys.freeMemMb || 0} MB`, 'System free memory')}
      </div>
    `;

    const details = document.createElement('section');
    details.className = 'card';
    details.style.marginTop = '18px';
    details.innerHTML = `
      <div class="kicker">PROCESS DETAILS</div>
      <h2>Runtime Information</h2>
      <div class="muted">
        Node: ${proc.nodeVersion || '-'}<br>
        Platform: ${proc.platform || '-'}<br>
        Arch: ${proc.arch || '-'}<br>
        CWD: ${proc.cwd || '-'}<br>
        Hostname: ${sys.hostname || '-'}<br>
        Total Memory: ${sys.totalMemMb || 0} MB<br>
        Load Average: ${(sys.loadAverage || []).join(', ') || '-'}
      </div>
    `;
    content.appendChild(details);

    const logsWrap = document.createElement('section');
    logsWrap.className = 'card';
    logsWrap.style.marginTop = '18px';
    logsWrap.innerHTML = `
      <div class="kicker">LATEST LOGS</div>
      <h2>Recent Diagnostic Logs</h2>
      ${logs.length ? logs.map(item => `
        <div class="list-card">
          <strong>${item.level || 'log'}</strong><br>
          <span class="muted">${item.message || ''}</span><br>
          <span class="muted">${item.createdAt || ''}</span>
        </div>
      `).join('') : '<div class="muted">No diagnostic logs.</div>'}
    `;
    content.appendChild(logsWrap);

  } catch (error) {
    USGIOSAlert.show({ title: 'Diagnostics Error', message: error.message, type: 'error' });
  }
}

loadDiagnosticsConsole();
