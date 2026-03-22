window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function logCard(item) {
  return `
    <div class="list-card">
      <strong>${item.level || 'log'}</strong><br>
      <span class="muted">${item.message || ''}</span><br>
      <span class="muted">${item.createdAt || ''}</span>
      ${item.meta ? `<pre style="white-space:pre-wrap;margin-top:8px">${JSON.stringify(item.meta, null, 2)}</pre>` : ''}
    </div>
  `;
}

async function loadLogViewer() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'LOGS',
    title: 'Log Viewer',
    subtitle: 'Inspect recent request logs, app events, and buffered runtime messages'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Log Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-logs-btn" class="primary-btn" type="button">Refresh</button>
        <button id="test-log-btn" class="ghost-btn" type="button">Emit Test Log</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-logs-btn').onclick = () => loadLogViewer();
  document.getElementById('test-log-btn').onclick = async () => {
    await apiFetch('/api/diagnostics/test-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'info', message: 'Manual test log from UI', meta: { source: 'log-viewer' } })
    });
    loadLogViewer();
  };

  try {
    const res = await apiFetch('/api/diagnostics/logs');
    const data = await res.json();
    const rows = data.logs || [];

    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';
    wrap.innerHTML = `
      <div class="kicker">RECENT LOGS</div>
      <h2>Buffered Runtime Logs</h2>
      ${rows.length ? rows.map(logCard).join('') : '<div class="muted">No logs available.</div>'}
    `;
    content.appendChild(wrap);
  } catch (error) {
    USGIOSAlert.show({ title: 'Log Viewer Error', message: error.message, type: 'error' });
  }
}

loadLogViewer();
