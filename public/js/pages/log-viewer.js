window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

let logViewerRows = [];
let logViewerSearch = '';
let logViewerLevel = '';
let logViewerSource = '';

async function safeJson(url, options) {
  try {
    const res = await apiFetch(url, options || {});
    return await res.json();
  } catch {
    return {};
  }
}

function normalizeLogs(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.logs)) return payload.logs;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.entries)) return payload.entries;
  return [];
}

function pick(obj, keys, fallback = '-') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  return fallback;
}

function levelBadge(level) {
  const v = String(level || '').toLowerCase();
  if (['info', 'success', 'ok'].includes(v)) return USGPageKit.statusBadge('online');
  if (['warn', 'warning'].includes(v)) return USGPageKit.statusBadge('warning');
  if (['error', 'fatal', 'failed'].includes(v)) return USGPageKit.statusBadge('error');
  return USGPageKit.statusBadge('neutral');
}

function infoCard(title, value, desc) {
  return `
    <section class="card">
      <div class="kicker">LOGS</div>
      <h2>${title}</h2>
      <div class="info-value" style="font-size:28px;font-weight:800">${value}</div>
      <div class="muted">${desc}</div>
    </section>
  `;
}

function logCard(item) {
  const level = pick(item, ['level', 'severity', 'type'], 'log');
  const source = pick(item, ['source', 'module', 'service', 'context'], 'system');
  const message = pick(item, ['message', 'text', 'summary'], '-');
  const createdAt = pick(item, ['createdAt', 'timestamp', 'time'], '-');

  return `
    <div class="list-card">
      <strong>${message}</strong><br>
      <span class="muted">Level: ${level}</span><br>
      <span class="muted">Source: ${source}</span><br>
      <span class="muted">Time: ${createdAt}</span>
      <div class="actions" style="margin-top:10px">
        ${levelBadge(level)}
      </div>
    </div>
  `;
}

function applyFilters(rows) {
  return rows.filter((item) => {
    const level = String(pick(item, ['level', 'severity', 'type'], '')).toLowerCase();
    const source = String(pick(item, ['source', 'module', 'service', 'context'], '')).toLowerCase();
    const message = String(pick(item, ['message', 'text', 'summary'], '')).toLowerCase();

    const matchSearch = !logViewerSearch || message.includes(logViewerSearch) || source.includes(logViewerSearch) || level.includes(logViewerSearch);
    const matchLevel = !logViewerLevel || level === logViewerLevel;
    const matchSource = !logViewerSource || source === logViewerSource;

    return matchSearch && matchLevel && matchSource;
  });
}

function uniqueSources(rows) {
  return Array.from(new Set(rows.map(item => String(pick(item, ['source', 'module', 'service', 'context'], 'system')).toLowerCase()))).filter(Boolean);
}

function renderLogViewer() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const filtered = applyFilters(logViewerRows);
  const sources = uniqueSources(logViewerRows);

  const total = logViewerRows.length;
  const errors = logViewerRows.filter(item => String(pick(item, ['level', 'severity', 'type'], '')).toLowerCase() === 'error').length;
  const warnings = logViewerRows.filter(item => {
    const v = String(pick(item, ['level', 'severity', 'type'], '')).toLowerCase();
    return v === 'warn' || v === 'warning';
  }).length;
  const infos = logViewerRows.filter(item => {
    const v = String(pick(item, ['level', 'severity', 'type'], '')).toLowerCase();
    return v === 'info' || v === 'success' || v === 'ok';
  }).length;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'OPERATIONS',
    title: 'Log Viewer',
    subtitle: 'Inspect unified logs across system, diagnostics, and application modules'
  });

  content.innerHTML += `
    <section class="card">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>Log Controls</h2>
        </div>
        <div class="actions">
          <button id="lv-refresh-btn" class="ghost-btn" type="button">Refresh</button>
          <a href="/pages/app-logs.html" class="ghost-btn">App Logs</a>
          <a href="/pages/diagnostics-console.html" class="ghost-btn">Diagnostics</a>
          <a href="/pages/system-health.html" class="primary-btn">System Health</a>
        </div>
      </div>

      <div class="grid-3" style="margin-top:18px">
        <div>
          <label class="muted">Search</label>
          <input id="lv-search" placeholder="Search message, source, or level" value="${logViewerSearch.replaceAll('"', '&quot;')}" style="width:100%;margin-top:6px">
        </div>
        <div>
          <label class="muted">Level</label>
          <select id="lv-level" style="width:100%;margin-top:6px">
            <option value="">All levels</option>
            <option value="info" ${logViewerLevel === 'info' ? 'selected' : ''}>Info</option>
            <option value="warning" ${logViewerLevel === 'warning' ? 'selected' : ''}>Warning</option>
            <option value="warn" ${logViewerLevel === 'warn' ? 'selected' : ''}>Warn</option>
            <option value="error" ${logViewerLevel === 'error' ? 'selected' : ''}>Error</option>
          </select>
        </div>
        <div>
          <label class="muted">Source</label>
          <select id="lv-source" style="width:100%;margin-top:6px">
            <option value="">All sources</option>
            ${sources.map(src => `<option value="${src}" ${logViewerSource === src ? 'selected' : ''}>${src}</option>`).join('')}
          </select>
        </div>
      </div>
    </section>
  `;

  content.innerHTML += `
    <div class="grid-4" style="margin-top:18px">
      ${infoCard('Total Logs', total, 'Unified log entries loaded')}
      ${infoCard('Errors', errors, 'High priority issues')}
      ${infoCard('Warnings', warnings, 'Warnings requiring review')}
      ${infoCard('Info', infos, 'General operational events')}
    </div>
  `;

  content.innerHTML += `
    <section class="card" style="margin-top:18px">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">LOG STREAM</div>
          <h2>Recent Logs</h2>
        </div>
        <div class="actions">
          ${levelBadge(errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'info')}
        </div>
      </div>
      ${
        filtered.length
          ? filtered.slice(0, 30).map(logCard).join('')
          : USGPageKit.emptyState({ title: 'No logs match the current filters' })
      }
    </section>
  `;

  content.innerHTML += `
    <section class="card" style="margin-top:18px">
      <div class="kicker">RAW PAYLOAD</div>
      <h2>Log Data</h2>
      <pre style="white-space:pre-wrap">${JSON.stringify(filtered.slice(0, 20), null, 2)}</pre>
    </section>
  `;

  document.getElementById('lv-refresh-btn').onclick = () => initLogViewer();
  document.getElementById('lv-search').oninput = (e) => {
    logViewerSearch = String(e.target.value || '').trim().toLowerCase();
    renderLogViewer();
  };
  document.getElementById('lv-level').onchange = (e) => {
    logViewerLevel = String(e.target.value || '').trim().toLowerCase();
    renderLogViewer();
  };
  document.getElementById('lv-source').onchange = (e) => {
    logViewerSource = String(e.target.value || '').trim().toLowerCase();
    renderLogViewer();
  };

  if (window.USGShell && typeof window.USGShell.setupRawToggles === 'function') {
    window.USGShell.setupRawToggles(content);
  }
}

async function initLogViewer() {
  const content = document.getElementById('page-content');
  if (content) {
    content.innerHTML = `<section class="card"><div class="muted">Loading log viewer...</div></section>`;
  }

  const [unified, diagnostics] = await Promise.all([
    safeJson('/api/platform-logs/unified'),
    safeJson('/api/diagnostics/logs')
  ]);

  const rows = [
    ...normalizeLogs(unified),
    ...normalizeLogs(diagnostics)
  ];

  const unique = [];
  const seen = new Set();

  for (const item of rows) {
    const key = JSON.stringify([
      pick(item, ['createdAt', 'timestamp', 'time'], ''),
      pick(item, ['level', 'severity', 'type'], ''),
      pick(item, ['source', 'module', 'service', 'context'], ''),
      pick(item, ['message', 'text', 'summary'], '')
    ]);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  logViewerRows = unique;
  renderLogViewer();
}

initLogViewer();
