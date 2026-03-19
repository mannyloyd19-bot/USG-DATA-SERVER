requireAuth();
USGShell.buildShell();

async function loadApiKeyLogs() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="card">
      <div class="kicker">API KEY AUDIT</div>
      <h2>API Key Request Logs</h2>
      <div class="muted">Latest tracked requests using API keys.</div>
      <div id="api-key-logs-list" style="margin-top:18px">Loading...</div>
    </section>
  `;

  const list = document.getElementById('api-key-logs-list');

  try {
    const res = await apiFetch('/api/api-key-logs');
    const rows = await res.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      list.innerHTML = '<div class="muted">No API key logs found yet.</div>';
      return;
    }

    list.innerHTML = rows.map(item => `
      <div class="list-card">
        <strong>${item.apiKeyName || 'Unknown API Key'}</strong><br>
        <span class="muted">path: ${item.path}</span><br>
        <span class="muted">method: ${item.method} · status: ${item.statusCode}</span><br>
        <span class="muted">ip: ${item.ipAddress || '-'} · time: ${new Date(item.createdAt).toLocaleString()}</span>
      </div>
    `).join('');
  } catch (error) {
    list.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

loadApiKeyLogs();
