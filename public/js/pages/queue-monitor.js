window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function safeJson(url, options) {
  try {
    const res = await apiFetch(url, options || {});
    return await res.json();
  } catch {
    return {};
  }
}

function normalizeJobs(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.jobs)) return payload.jobs;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function countByStatus(rows, status) {
  return rows.filter(item => String(item.status || '').toLowerCase() === status).length;
}

function statusBadge(value) {
  const v = String(value || '').toLowerCase();
  if (['completed', 'success', 'done'].includes(v)) return USGPageKit.statusBadge('online');
  if (['running', 'processing', 'active'].includes(v)) return USGPageKit.statusBadge('warning');
  if (['failed', 'error'].includes(v)) return USGPageKit.statusBadge('error');
  if (['pending', 'queued'].includes(v)) return USGPageKit.statusBadge('neutral');
  return USGPageKit.statusBadge('neutral');
}

function infoCard(title, value, desc) {
  return `
    <section class="card">
      <div class="kicker">QUEUE</div>
      <h2>${title}</h2>
      <div class="info-value" style="font-size:28px;font-weight:800">${value}</div>
      <div class="muted">${desc}</div>
    </section>
  `;
}

function jobCard(item) {
  const id = item.id || item.jobId || '-';
  const type = item.type || item.name || item.jobType || 'Job';
  const status = item.status || 'unknown';
  const createdAt = item.createdAt || item.created_at || '-';
  const updatedAt = item.updatedAt || item.updated_at || '-';

  return `
    <div class="list-card">
      <strong>${type}</strong><br>
      <span class="muted">ID: ${id}</span><br>
      <span class="muted">Status: ${status}</span><br>
      <span class="muted">Created: ${createdAt}</span><br>
      <span class="muted">Updated: ${updatedAt}</span>
      <div class="actions" style="margin-top:10px">
        ${statusBadge(status)}
      </div>
    </div>
  `;
}

async function loadQueueMonitor() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'OPERATIONS',
    title: 'Queue Monitor',
    subtitle: 'Track queued, running, completed, and failed background jobs'
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
        <button id="queue-refresh-btn" class="ghost-btn" type="button">Refresh</button>
        <a href="/pages/system-health.html" class="ghost-btn">System Health</a>
        <a href="/pages/diagnostics-console.html" class="ghost-btn">Diagnostics</a>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('queue-refresh-btn').onclick = () => loadQueueMonitor();

  const loading = document.createElement('section');
  loading.className = 'card';
  loading.style.marginTop = '18px';
  loading.innerHTML = `<div class="muted">Loading queue monitor...</div>`;
  content.appendChild(loading);

  try {
    const payload = await safeJson('/api/job-queue');
    const rows = normalizeJobs(payload);

    const pending = countByStatus(rows, 'pending') + countByStatus(rows, 'queued');
    const running = countByStatus(rows, 'running') + countByStatus(rows, 'processing');
    const completed = countByStatus(rows, 'completed') + countByStatus(rows, 'success');
    const failed = countByStatus(rows, 'failed') + countByStatus(rows, 'error');

    loading.remove();

    content.innerHTML += `
      <div class="grid-4" style="margin-top:18px">
        ${infoCard('Pending', pending, 'Jobs waiting in queue')}
        ${infoCard('Running', running, 'Jobs currently processing')}
        ${infoCard('Completed', completed, 'Jobs completed successfully')}
        ${infoCard('Failed', failed, 'Jobs that require attention')}
      </div>
    `;

    content.innerHTML += `
      <section class="card" style="margin-top:18px">
        <div class="usg-page-head-row">
          <div>
            <div class="kicker">JOB STREAM</div>
            <h2>Recent Queue Jobs</h2>
          </div>
          <div class="actions">
            ${statusBadge(failed > 0 ? 'failed' : running > 0 ? 'running' : 'completed')}
          </div>
        </div>
        ${
          rows.length
            ? rows.slice(0, 20).map(jobCard).join('')
            : USGPageKit.emptyState({ title: 'No queue jobs found' })
        }
      </section>
    `;

    content.innerHTML += `
      <section class="card" style="margin-top:18px">
        <div class="kicker">QUICK LINKS</div>
        <h2>Queue Operations</h2>
        <div class="actions" style="flex-wrap:wrap">
          <a href="/pages/system-health.html" class="ghost-btn">System Health</a>
          <a href="/pages/backup-monitor.html" class="ghost-btn">Backup Monitor</a>
          <a href="/pages/log-viewer.html" class="ghost-btn">Log Viewer</a>
          <a href="/pages/app-logs.html" class="ghost-btn">App Logs</a>
        </div>
      </section>
    `;
  } catch (error) {
    loading.remove();

    const err = document.createElement('section');
    err.className = 'card';
    err.style.marginTop = '18px';
    err.innerHTML = `
      <div class="kicker">ERROR</div>
      <h2>Queue Monitor Failed</h2>
      <div class="muted">${error.message}</div>
    `;
    content.appendChild(err);
  }
}

loadQueueMonitor();
