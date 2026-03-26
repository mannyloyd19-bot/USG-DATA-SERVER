window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

let qbCollections = [];
let qbSaved = [];
let qbLastResult = null;

async function safeJson(url, options) {
  try {
    const res = await apiFetch(url, options || {});
    return await res.json();
  } catch {
    return {};
  }
}

function parseJsonInput(raw, fallback = {}) {
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return null;
  }
}

function section(title, body, kicker = 'QUERY BUILDER') {
  return `
    <section class="card" style="margin-top:18px">
      <div class="kicker">${kicker}</div>
      <h2>${title}</h2>
      ${body}
    </section>
  `;
}

function renderSavedCard(item) {
  const id = item.id || item._id || '';
  const name = item.name || item.title || 'Saved Query';
  const collectionKey = item.collectionKey || item.collection || '-';
  const limit = item.limit || 20;
  return `
    <div class="list-card">
      <strong>${name}</strong><br>
      <span class="muted">Collection: ${collectionKey}</span><br>
      <span class="muted">Limit: ${limit}</span>
      <div class="actions" style="margin-top:10px">
        <button class="ghost-btn" type="button" data-qb-load="${id}">Load</button>
        <button class="danger-btn" type="button" data-qb-delete="${id}">Delete</button>
      </div>
    </div>
  `;
}

function renderResultSummary(result) {
  const rows = Array.isArray(result?.rows) ? result.rows : Array.isArray(result?.data) ? result.data : [];
  return `
    <div class="grid-3">
      <div class="list-card">
        <strong>Rows</strong><br>
        <span class="muted">${rows.length}</span>
      </div>
      <div class="list-card">
        <strong>Collection</strong><br>
        <span class="muted">${result?.collectionKey || '-'}</span>
      </div>
      <div class="list-card">
        <strong>Status</strong><br>
        <span class="muted">Executed</span>
      </div>
    </div>
  `;
}

function renderResultsTable(result) {
  const rows = Array.isArray(result?.rows) ? result.rows : Array.isArray(result?.data) ? result.data : [];
  if (!rows.length) {
    return USGPageKit.emptyState({ title: 'No query results returned' });
  }

  const normalized = rows.map((row) => {
    if (row && typeof row === 'object' && !Array.isArray(row)) return row;
    return { value: row };
  });

  const keys = Array.from(new Set(normalized.flatMap(r => Object.keys(r)))).slice(0, 8);

  return `
    <div style="overflow:auto">
      <table class="matrix-table">
        <thead>
          <tr>
            ${keys.map(k => `<th>${k}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${normalized.map(row => `
            <tr>
              ${keys.map(k => `<td>${typeof row[k] === 'object' ? JSON.stringify(row[k]) : (row[k] ?? '')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function getSelectedCollection() {
  const sel = document.getElementById('qb-collection');
  return sel ? sel.value : '';
}

function getCurrentPayload() {
  const collectionKey = getSelectedCollection();
  const filterRaw = document.getElementById('qb-filter')?.value || '{}';
  const sortRaw = document.getElementById('qb-sort')?.value || '{}';
  const projectionRaw = document.getElementById('qb-projection')?.value || '{}';
  const limitRaw = document.getElementById('qb-limit')?.value || '20';
  const nameRaw = document.getElementById('qb-name')?.value || '';

  return {
    name: nameRaw.trim(),
    collectionKey,
    filterRaw,
    sortRaw,
    projectionRaw,
    limit: Number(limitRaw || 20)
  };
}

function applySavedToForm(item) {
  document.getElementById('qb-name').value = item.name || item.title || '';
  document.getElementById('qb-collection').value = item.collectionKey || item.collection || '';
  document.getElementById('qb-filter').value = JSON.stringify(item.filter || {}, null, 2);
  document.getElementById('qb-sort').value = JSON.stringify(item.sort || {}, null, 2);
  document.getElementById('qb-projection').value = JSON.stringify(item.projection || {}, null, 2);
  document.getElementById('qb-limit').value = item.limit || 20;
}

async function loadCollections() {
  const res = await safeJson('/api/collections');
  qbCollections = Array.isArray(res) ? res : (res.collections || res.data || []);
}

async function loadSavedQueries() {
  const res = await safeJson('/api/query-builder-pro/saved');
  qbSaved = Array.isArray(res) ? res : (res.saved || res.queries || res.data || []);
}

async function executeQuery() {
  const payload = getCurrentPayload();

  if (!payload.collectionKey) {
    USGIOSAlert.show({ title: 'Query Builder', message: 'Select a collection first.', type: 'error' });
    return;
  }

  const filter = parseJsonInput(payload.filterRaw);
  const sort = parseJsonInput(payload.sortRaw);
  const projection = parseJsonInput(payload.projectionRaw);

  if (filter === null || sort === null || projection === null) {
    USGIOSAlert.show({ title: 'Query Builder', message: 'Filter, sort, and projection must be valid JSON.', type: 'error' });
    return;
  }

  const result = await safeJson('/api/query-builder-pro/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collectionKey: payload.collectionKey,
      filter,
      sort,
      projection,
      limit: payload.limit
    })
  });

  qbLastResult = {
    collectionKey: payload.collectionKey,
    rows: Array.isArray(result) ? result : (result.rows || result.data || []),
    raw: result
  };

  USGIOSAlert.show({ title: 'Query Builder', message: 'Query executed.' });
  renderQueryBuilder();
}

async function saveQuery() {
  const payload = getCurrentPayload();

  if (!payload.name) {
    USGIOSAlert.show({ title: 'Query Builder', message: 'Enter a query name before saving.', type: 'error' });
    return;
  }

  if (!payload.collectionKey) {
    USGIOSAlert.show({ title: 'Query Builder', message: 'Select a collection first.', type: 'error' });
    return;
  }

  const filter = parseJsonInput(payload.filterRaw);
  const sort = parseJsonInput(payload.sortRaw);
  const projection = parseJsonInput(payload.projectionRaw);

  if (filter === null || sort === null || projection === null) {
    USGIOSAlert.show({ title: 'Query Builder', message: 'Filter, sort, and projection must be valid JSON.', type: 'error' });
    return;
  }

  const result = await safeJson('/api/query-builder-pro/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      collectionKey: payload.collectionKey,
      filter,
      sort,
      projection,
      limit: payload.limit
    })
  });

  await loadSavedQueries();
  USGIOSAlert.show({ title: 'Query Builder', message: result.message || 'Query saved.' });
  renderQueryBuilder();
}

async function deleteSavedQuery(id) {
  await safeJson(`/api/query-builder-pro/saved/${id}`, { method: 'DELETE' });
  await loadSavedQueries();
  USGIOSAlert.show({ title: 'Query Builder', message: 'Saved query deleted.' });
  renderQueryBuilder();
}

function bindSavedQueryEvents() {
  qbSaved.forEach((item) => {
    const id = item.id || item._id || '';
    const loadBtn = document.querySelector(`[data-qb-load="${id}"]`);
    const delBtn = document.querySelector(`[data-qb-delete="${id}"]`);

    if (loadBtn) {
      loadBtn.onclick = () => {
        applySavedToForm(item);
        USGIOSAlert.show({ title: 'Query Builder', message: 'Saved query loaded.' });
      };
    }

    if (delBtn) {
      delBtn.onclick = () => {
        USGCrudKit.remove({
          title: 'Delete Saved Query',
          message: 'Delete this saved query?',
          endpoint: `/api/query-builder-pro/saved/${id}`,
          onDone: async () => {
            await loadSavedQueries();
            renderQueryBuilder();
          }
        });
      };
    }
  });
}

function renderQueryBuilder() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'TOOLS',
    title: 'Query Builder',
    subtitle: 'Build, execute, preview, and save collection queries'
  });

  const collectionOptions = qbCollections.map(c => {
    const value = c.key || c.id || '';
    const label = c.name || c.key || c.id || 'Collection';
    return `<option value="${value}">${label}</option>`;
  }).join('');

  const savedPanel = qbSaved.length
    ? qbSaved.map(renderSavedCard).join('')
    : USGPageKit.emptyState({ title: 'No saved queries yet' });

  content.innerHTML = `
    <section class="card">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>Query Controls</h2>
        </div>
        <div class="actions">
          <button id="qb-refresh-btn" class="ghost-btn" type="button">Refresh</button>
          <button id="qb-execute-btn" class="primary-btn" type="button">Execute Query</button>
          <button id="qb-save-btn" class="ghost-btn" type="button">Save Query</button>
        </div>
      </div>

      <div class="grid-2" style="margin-top:18px">
        <div>
          <label class="muted">Query Name</label>
          <input id="qb-name" placeholder="Recent Orders by Status" style="width:100%;margin-top:6px">
        </div>
        <div>
          <label class="muted">Collection</label>
          <select id="qb-collection" style="width:100%;margin-top:6px">
            <option value="">Select collection</option>
            ${collectionOptions}
          </select>
        </div>
      </div>

      <div class="grid-2" style="margin-top:18px">
        <div>
          <label class="muted">Filter JSON</label>
          <textarea id="qb-filter" style="width:100%;min-height:160px;margin-top:6px">{"isDeleted": false}</textarea>
        </div>
        <div>
          <label class="muted">Sort JSON</label>
          <textarea id="qb-sort" style="width:100%;min-height:160px;margin-top:6px">{"createdAt": -1}</textarea>
        </div>
      </div>

      <div class="grid-2" style="margin-top:18px">
        <div>
          <label class="muted">Projection JSON</label>
          <textarea id="qb-projection" style="width:100%;min-height:120px;margin-top:6px">{}</textarea>
        </div>
        <div>
          <label class="muted">Limit</label>
          <input id="qb-limit" type="number" value="20" min="1" max="500" style="width:100%;margin-top:6px">
        </div>
      </div>
    </section>
  `;

  content.innerHTML += section('Saved Queries', savedPanel, 'SAVED');

  if (qbLastResult) {
    content.innerHTML += section(
      'Result Summary',
      renderResultSummary(qbLastResult),
      'RESULTS'
    );

    content.innerHTML += section(
      'Query Results',
      renderResultsTable(qbLastResult),
      'RESULTS'
    );

    content.innerHTML += section(
      'Raw Response',
      `<pre style="white-space:pre-wrap">${JSON.stringify(qbLastResult.raw || {}, null, 2)}</pre>`,
      'RAW'
    );
  } else {
    content.innerHTML += section(
      'Result Summary',
      USGPageKit.emptyState({ title: 'Run a query to preview results' }),
      'RESULTS'
    );
  }

  document.getElementById('qb-refresh-btn').onclick = async () => {
    await loadCollections();
    await loadSavedQueries();
    renderQueryBuilder();
  };

  document.getElementById('qb-execute-btn').onclick = () => executeQuery();
  document.getElementById('qb-save-btn').onclick = () => saveQuery();

  if (window.USGShell && typeof window.USGShell.setupRawToggles === 'function') {
    window.USGShell.setupRawToggles(content);
  }

  bindSavedQueryEvents();
}

async function initQueryBuilder() {
  const content = document.getElementById('page-content');
  if (content) {
    content.innerHTML = `<section class="card"><div class="muted">Loading query builder...</div></section>`;
  }

  await loadCollections();
  await loadSavedQueries();
  renderQueryBuilder();
}

initQueryBuilder();
