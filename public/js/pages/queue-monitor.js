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

function jobCard(item) {
  return `
    <div class="list-card">
      <strong>${item.type || item.jobType || 'Job'}</strong><br>
      <span class="muted">Status: ${item.status || '-'}</span><br>
      <span class="muted">Created: ${item.createdAt || ''}</span><br>
      <span class="muted">Error: ${item.error || '-'}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(item.status || 'unknown')}
        <button class="ghost-btn" data-retry-job="${item.id}" type="button">Retry</button>
        <button class="danger-btn" data-cancel-job="${item.id}" type="button">Cancel</button>
      </div>
    </div>
  `;
}

async function loadQueueMonitor() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'QUEUE',
    title: 'Queue Monitor',
    subtitle: 'Inspect background jobs, failures, retries, and queue activity'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Queue Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-queue-btn" class="primary-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-queue-btn').onclick = () => loadQueueMonitor();

  try {
    const [summaryRes, jobsRes] = await Promise.all([
      apiFetch('/api/queue-monitor/summary'),
      apiFetch('/api/queue-monitor/jobs')
    ]);

    const summaryData = await summaryRes.json();
    const jobsData = await jobsRes.json();

    const summary = summaryData.summary || {};
    const jobs = jobsData.jobs || [];

    content.innerHTML += `
      <div class="grid-5">
        ${metricCard('Total', summary.total || 0, 'All jobs')}
        ${metricCard('Pending', summary.pending || 0, 'Queued jobs')}
        ${metricCard('Running', summary.running || 0, 'Active jobs')}
        ${metricCard('Completed', summary.completed || 0, 'Finished jobs')}
        ${metricCard('Failed', summary.failed || 0, 'Failed jobs')}
      </div>
    `;

    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';
    wrap.innerHTML = `
      <div class="kicker">JOBS</div>
      <h2>Recent Queue Jobs</h2>
      ${jobs.length ? jobs.map(jobCard).join('') : '<div class="muted">No queue jobs found.</div>'}
    `;
    content.appendChild(wrap);

    jobs.forEach(item => {
      const retryBtn = document.querySelector(`[data-retry-job="${item.id}"]`);
      if (retryBtn) {
        retryBtn.onclick = async () => {
          await apiFetch(`/api/queue-monitor/jobs/${item.id}/retry`, { method: 'POST' });
          loadQueueMonitor();
        };
      }

      const cancelBtn = document.querySelector(`[data-cancel-job="${item.id}"]`);
      if (cancelBtn) {
        cancelBtn.onclick = async () => {
          await apiFetch(`/api/queue-monitor/jobs/${item.id}/cancel`, { method: 'POST' });
          loadQueueMonitor();
        };
      }
    });
  } catch (error) {
    USGIOSAlert.show({ title: 'Queue Monitor Error', message: error.message, type: 'error' });
  }
}

loadQueueMonitor();
