requireAuth();
USGShell.buildShell();

async function loadQueryBuilderAdvanced() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'QUERY',
    title: 'Advanced Query Builder',
    subtitle: 'Build filters, sort conditions, and preview query JSON'
  });

  content.innerHTML += `
    <div class="grid-2" style="margin-top:18px">
      <section class="card">
        <div class="kicker">QUERY INPUT</div>
        <h2>Builder</h2>
        <input id="qb-collection" placeholder="Collection key">
        <input id="qb-filter-field" placeholder="Filter field">
        <input id="qb-filter-value" placeholder="Filter value">
        <input id="qb-sort-field" placeholder="Sort field">
        <select id="qb-sort-order">
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </select>
        <div class="actions">
          <button class="primary-btn" id="qb-generate">Generate Query</button>
        </div>
      </section>

      <section class="card">
        <div class="kicker">QUERY OUTPUT</div>
        <h2>Preview</h2>
        <pre id="qb-output">No query generated yet.</pre>
      </section>
    </div>
  `;

  document.getElementById('qb-generate').addEventListener('click', () => {
    const query = {
      collection: document.getElementById('qb-collection').value.trim(),
      filter: {
        [document.getElementById('qb-filter-field').value.trim() || 'field']:
          document.getElementById('qb-filter-value').value.trim()
      },
      sort: {
        field: document.getElementById('qb-sort-field').value.trim(),
        order: document.getElementById('qb-sort-order').value
      }
    };

    document.getElementById('qb-output').textContent = JSON.stringify(query, null, 2);
  });
}

loadQueryBuilderAdvanced();
