requireAuth();
USGShell.buildShell();

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function toDateValue(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function matchesDateRange(rowDate, from, to) {
  const time = new Date(rowDate).getTime();
  if (Number.isNaN(time)) return false;

  if (from) {
    const fromTime = new Date(from + 'T00:00:00').getTime();
    if (time < fromTime) return false;
  }

  if (to) {
    const toTime = new Date(to + 'T23:59:59').getTime();
    if (time > toTime) return false;
  }

  return true;
}

function matchesStatus(statusCode, filter) {
  if (!filter || filter === 'all') return true;
  const code = Number(statusCode || 0);

  if (filter === '2xx') return code >= 200 && code < 300;
  if (filter === '4xx') return code >= 400 && code < 500;
  if (filter === '5xx') return code >= 500 && code < 600;

  return String(code) === String(filter);
}

async function loadApiKeyAnalytics() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="card">
      <div class="kicker">API KEY ANALYTICS</div>
      <h2>Overview</h2>

      <div class="grid-3" style="margin-top:16px">
        <div class="info-card">
          <div class="info-title">Date From</div>
          <input id="filter-date-from" type="date" style="margin:0">
        </div>
        <div class="info-card">
          <div class="info-title">Date To</div>
          <input id="filter-date-to" type="date" style="margin:0">
        </div>
        <div class="info-card">
          <div class="info-title">Status Filter</div>
          <select id="filter-status" style="margin:0">
            <option value="all">All</option>
            <option value="2xx">2xx Success</option>
            <option value="4xx">4xx Client Error</option>
            <option value="5xx">5xx Server Error</option>
            <option value="200">200</option>
            <option value="401">401</option>
            <option value="403">403</option>
            <option value="404">404</option>
            <option value="500">500</option>
          </select>
        </div>
      </div>

      <div class="grid-2" style="margin-top:18px">
        <div class="info-card">
          <div class="info-title">API Key Name</div>
          <input id="filter-key-name" placeholder="Search key name" style="margin:0">
        </div>
        <div class="info-card">
          <div class="info-title">Path Search</div>
          <input id="filter-path" placeholder="Search endpoint path" style="margin:0">
        </div>
      </div>

      <div class="actions">
        <button class="primary-btn" type="button" id="apply-filters">Apply Filters</button>
        <button class="ghost-btn" type="button" id="reset-filters">Reset</button>
      </div>
    </section>

    <section class="card">
      <div class="grid-3" id="api-analytics-stats">
        <div class="info-card">
          <div class="info-title">Total Logs</div>
          <div class="info-value" id="stat-total-logs">-</div>
        </div>
        <div class="info-card">
          <div class="info-title">Active Keys</div>
          <div class="info-value" id="stat-active-keys">-</div>
        </div>
        <div class="info-card">
          <div class="info-title">Filtered Logs</div>
          <div class="info-value" id="stat-filtered-logs">-</div>
        </div>
      </div>
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">TOP USED KEYS</div>
        <h2>Usage Ranking</h2>
        <div id="top-used-keys">Loading...</div>
      </section>

      <section class="card">
        <div class="kicker">RECENT ACTIVITY</div>
        <h2>Latest Requests</h2>
        <div id="recent-api-logs">Loading...</div>
      </section>
    </div>

    <section class="card">
      <div class="kicker">RAW SUMMARY</div>
      <h2>Analytics JSON</h2>
      <pre id="analytics-json">Loading...</pre>
    </section>
  `;

  const keysRes = await apiFetch('/api/api-keys');
  const logsRes = await apiFetch('/api/api-key-logs');

  const keys = await keysRes.json();
  const logs = await logsRes.json();

  const keyRows = Array.isArray(keys) ? keys : [];
  const logRows = Array.isArray(logs) ? logs : [];

  const dateFromEl = document.getElementById('filter-date-from');
  const dateToEl = document.getElementById('filter-date-to');
  const statusEl = document.getElementById('filter-status');
  const keyNameEl = document.getElementById('filter-key-name');
  const pathEl = document.getElementById('filter-path');

  function render() {
    const from = dateFromEl.value;
    const to = dateToEl.value;
    const statusFilter = statusEl.value;
    const keyNameFilter = keyNameEl.value.trim().toLowerCase();
    const pathFilter = pathEl.value.trim().toLowerCase();

    const filteredLogs = logRows.filter(item => {
      const okDate = matchesDateRange(item.createdAt, from, to);
      const okStatus = matchesStatus(item.statusCode, statusFilter);
      const okKey = !keyNameFilter || String(item.apiKeyName || '').toLowerCase().includes(keyNameFilter);
      const okPath = !pathFilter || String(item.path || '').toLowerCase().includes(pathFilter);
      return okDate && okStatus && okKey && okPath;
    });

    const activeKeys = keyRows.filter(k => (k.status || 'active') === 'active').length;

    document.getElementById('stat-total-logs').textContent = formatNumber(logRows.length);
    document.getElementById('stat-active-keys').textContent = formatNumber(activeKeys);
    document.getElementById('stat-filtered-logs').textContent = formatNumber(filteredLogs.length);

    const sortedKeys = [...keyRows].sort((a, b) => Number(b.usageCount || 0) - Number(a.usageCount || 0));
    const topUsed = sortedKeys.slice(0, 10);

    document.getElementById('top-used-keys').innerHTML =
      topUsed.length
        ? topUsed.map(item => `
            <div class="list-card">
              <strong>${item.name || 'Unnamed Key'}</strong><br>
              <span class="muted">${item.maskedKey || ''}</span><br>
              <span class="muted">usage count: ${item.usageCount ?? 0} · status: ${item.status || 'active'}</span><br>
              <span class="muted">owner: ${item.owner || '-'} · purpose: ${item.purpose || '-'}</span>
            </div>
          `).join('')
        : '<div class="muted">No API keys found.</div>';

    const recent = filteredLogs.slice(0, 20);
    document.getElementById('recent-api-logs').innerHTML =
      recent.length
        ? recent.map(item => `
            <div class="list-card">
              <strong>${item.apiKeyName || 'Unknown API Key'}</strong><br>
              <span class="muted">path: ${item.path}</span><br>
              <span class="muted">method: ${item.method} · status: ${item.statusCode}</span><br>
              <span class="muted">ip: ${item.ipAddress || '-'} · time: ${new Date(item.createdAt).toLocaleString()}</span>
            </div>
          `).join('')
        : '<div class="muted">No matching API key logs.</div>';

    document.getElementById('analytics-json').textContent = JSON.stringify({
      filters: {
        from,
        to,
        status: statusFilter,
        keyName: keyNameFilter,
        path: pathFilter
      },
      summary: {
        totalLogs: logRows.length,
        filteredLogs: filteredLogs.length,
        activeKeys
      },
      topUsedKeys: topUsed.map(item => ({
        id: item.id,
        name: item.name,
        usageCount: item.usageCount,
        status: item.status,
        owner: item.owner,
        purpose: item.purpose
      })),
      recentLogs: recent
    }, null, 2);

    USGShell.setupRawToggles(content);
  }

  document.getElementById('apply-filters').addEventListener('click', render);
  document.getElementById('reset-filters').addEventListener('click', () => {
    dateFromEl.value = '';
    dateToEl.value = '';
    statusEl.value = 'all';
    keyNameEl.value = '';
    pathEl.value = '';
    render();
  });

  render();
}

loadApiKeyAnalytics().catch((error) => {
  const content = document.getElementById('page-content');
  if (content) {
    content.innerHTML = `<section class="card"><h2>API Key Analytics</h2><div class="muted">${error.message}</div></section>`;
  }
});
