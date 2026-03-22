window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadQueryBuilderAdvanced() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'QUERY',
    title: 'Advanced Query Builder',
    subtitle: 'Build, save, and execute structured queries'
  });

  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">QUERY INPUT</div>
        <h2>Builder</h2>
        <input id="qb-name" placeholder="Saved query name">
        <input id="qb-collection" placeholder="Collection key">
        <input id="qb-filter-field" placeholder="Filter field (example: email)">
        <input id="qb-filter-value" placeholder="Filter value">
        <input id="qb-search" placeholder="Search text">
        <input id="qb-sort-field" placeholder="Sort field">
        <select id="qb-sort-order">
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </select>
        <input id="qb-page" placeholder="Page" value="1">
        <input id="qb-limit" placeholder="Limit" value="20">
        <input id="qb-select" placeholder="Select fields (comma separated)">
        <div class="actions">
          <button class="ghost-btn" id="qb-save">Save Query</button>
          <button class="primary-btn" id="qb-execute">Execute</button>
        </div>
      </section>

      <section class="card">
        <div class="kicker">RESULT</div>
        <h2>Output</h2>
        <pre id="qb-output">No query executed yet.</pre>
      </section>
    </div>

    <section class="card">
      <div class="kicker">SAVED QUERIES</div>
      <h2>Registry</h2>
      <div id="saved-query-list">Loading...</div>
    </section>
  `;

  function getQuery() {
    const filterField = document.getElementById('qb-filter-field').value.trim();
    const filterValue = document.getElementById('qb-filter-value').value.trim();
    const selectRaw = document.getElementById('qb-select').value.trim();

    const query = {
      search: document.getElementById('qb-search').value.trim(),
      page: document.getElementById('qb-page').value.trim() || '1',
      limit: document.getElementById('qb-limit').value.trim() || '20',
      sort: {
        field: document.getElementById('qb-sort-field').value.trim(),
        order: document.getElementById('qb-sort-order').value
      },
      select: selectRaw ? selectRaw.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    if (filterField) {
      query.filter = {
        [filterField]: { contains: filterValue }
      };
    }

    return query;
  }

  async function refreshSaved() {
    const res = await apiFetch('/api/query-builder-pro/saved');
    const data = await res.json();
    const rows = data.savedQueries || [];

    document.getElementById('saved-query-list').innerHTML = rows.length ? rows.map(row => `
      <div class="list-card">
        <strong>${row.name}</strong><br>
        <span class="muted">collection: ${row.collectionKey}</span>
        <div class="actions">
          <button class="ghost-btn" data-load="${row.id}">Load</button>
          <button class="danger-btn" data-delete="${row.id}">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No saved queries' });

    rows.forEach(row => {
      const loadBtn = document.querySelector(\`[data-load="\${row.id}"]\`);
      if (loadBtn) {
        loadBtn.onclick = () => {
          document.getElementById('qb-name').value = row.name || '';
          document.getElementById('qb-collection').value = row.collectionKey || '';
          const filterKey = Object.keys(row.queryJson?.filter || {})[0] || '';
          document.getElementById('qb-filter-field').value = filterKey;
          document.getElementById('qb-filter-value').value =
            row.queryJson?.filter?.[filterKey]?.contains ||
            row.queryJson?.filter?.[filterKey]?.eq ||
            '';
          document.getElementById('qb-search').value = row.queryJson?.search || '';
          document.getElementById('qb-sort-field').value = row.queryJson?.sort?.field || '';
          document.getElementById('qb-sort-order').value = row.queryJson?.sort?.order || 'asc';
          document.getElementById('qb-page').value = row.queryJson?.page || '1';
          document.getElementById('qb-limit').value = row.queryJson?.limit || '20';
          document.getElementById('qb-select').value = Array.isArray(row.queryJson?.select) ? row.queryJson.select.join(', ') : '';
        };
      }

      const delBtn = document.querySelector(\`[data-delete="\${row.id}"]\`);
      if (delBtn) {
        delBtn.onclick = async () => {
          await apiFetch(\`/api/query-builder-pro/saved/\${row.id}\`, { method: 'DELETE' });
          refreshSaved();
        };
      }
    });
  }

  document.getElementById('qb-save').onclick = async () => {
    const payload = {
      name: document.getElementById('qb-name').value.trim(),
      collectionKey: document.getElementById('qb-collection').value.trim(),
      query: getQuery()
    };

    const res = await apiFetch('/api/query-builder-pro/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    document.getElementById('qb-output').textContent = JSON.stringify(data, null, 2);
    refreshSaved();
  };

  document.getElementById('qb-execute').onclick = async () => {
    const payload = {
      collectionKey: document.getElementById('qb-collection').value.trim(),
      query: getQuery()
    };

    const res = await apiFetch('/api/query-builder-pro/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    document.getElementById('qb-output').textContent = JSON.stringify(data, null, 2);
  };

  await refreshSaved();
}
loadQueryBuilderAdvanced();
