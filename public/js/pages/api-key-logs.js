requireAuth();
USGShell.buildShell();

async function loadApiKeyLogs() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'API LOGS',
    title: 'API Key Logs',
    subtitle: 'Review API key activity, requests, and failures'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Log Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-key-logs-btn" class="ghost-btn" type="button">Refresh</button>
        <a href="/pages/api-keys.html" class="ghost-btn">Keys</a>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-key-logs-btn').onclick = () => loadApiKeyLogs();

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search API logs...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/api-key-logs');
    const data = await res.json();
    const rows = data.logs || data.apiKeyLogs || data.data || [];

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.keyName || item.name || 'API Request'}</strong><br>
        <span class="muted">Route: ${item.route || item.path || '-'}</span><br>
        <span class="muted">Status: ${item.statusCode || item.status || '-'}</span><br>
        <span class="muted">${item.createdAt || item.timestamp || ''}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No API key logs found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});
  } catch (err) {
    USGIOSAlert.show({ title: 'API Key Logs Error', message: err.message, type: 'error' });
  }
}
loadApiKeyLogs();
