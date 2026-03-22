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

function backupCard(item) {
  return `
    <div class="list-card">
      <strong>Backup Job</strong><br>
      <span class="muted">Status: ${item.status || '-'}</span><br>
      <span class="muted">Trigger: ${item.triggerMode || '-'}</span><br>
      <span class="muted">Created: ${item.createdAt || ''}</span><br>
      <span class="muted">Notes: ${item.notes || '-'}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(item.status || 'unknown')}
      </div>
    </div>
  `;
}

async function loadBackupMonitor() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'BACKUPS',
    title: 'Backup Monitor',
    subtitle: 'Inspect backup jobs, latest backup state, config, and manual backup control'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Backup Controls</h2>
      </div>
      <div class="actions">
        <button id="run-backup-btn" class="primary-btn" type="button">Run Backup Now</button>
        <button id="refresh-backup-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-backup-btn').onclick = () => loadBackupMonitor();
  document.getElementById('run-backup-btn').onclick = async () => {
    await apiFetch('/api/backup-monitor/run-now', { method: 'POST' });
    loadBackupMonitor();
  };

  try {
    const [summaryRes, jobsRes] = await Promise.all([
      apiFetch('/api/backup-monitor/summary'),
      apiFetch('/api/backup-monitor/jobs')
    ]);

    const summaryData = await summaryRes.json();
    const jobsData = await jobsRes.json();

    const summary = summaryData.summary || {};
    const latest = summaryData.latest || {};
    const config = summaryData.config || {};
    const jobs = jobsData.backups || [];

    content.innerHTML += `
      <div class="grid-4">
        ${metricCard('Total', summary.total || 0, 'All backup jobs')}
        ${metricCard('Success', summary.success || 0, 'Successful backups')}
        ${metricCard('Failed', summary.failed || 0, 'Failed backups')}
        ${metricCard('Running', summary.running || 0, 'Currently running')}
      </div>
    `;

    const details = document.createElement('section');
    details.className = 'card';
    details.style.marginTop = '18px';
    details.innerHTML = `
      <div class="kicker">LATEST STATUS</div>
      <h2>Backup Summary</h2>
      <div class="muted">
        Latest Status: ${latest.status || '-'}<br>
        Latest Created: ${latest.createdAt || '-'}<br>
        Trigger Mode: ${latest.triggerMode || '-'}<br>
        Auto Backup: ${config.autoEnabled !== undefined ? String(config.autoEnabled) : '-'}<br>
        Frequency: ${config.frequency || '-'}
      </div>
    `;
    content.appendChild(details);

    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';
    wrap.innerHTML = `
      <div class="kicker">BACKUP JOBS</div>
      <h2>Recent Backups</h2>
      ${jobs.length ? jobs.map(backupCard).join('') : '<div class="muted">No backup jobs found.</div>'}
    `;
    content.appendChild(wrap);
  } catch (error) {
    USGIOSAlert.show({ title: 'Backup Monitor Error', message: error.message, type: 'error' });
  }
}

loadBackupMonitor();
