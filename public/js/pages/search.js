requireAuth();
USGShell.buildShell();

function getInitialQuery() {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get('q') || '';
  } catch {
    return '';
  }
}

async function search(q) {
  const res = await apiFetch('/api/search/global?q=' + encodeURIComponent(q));
  return await res.json();
}

function resultCard(item) {
  let link = '#';

  if (item.type === 'user') link = '/pages/users.html';
  if (item.type === 'tenant') link = '/pages/tenants.html';
  if (item.type === 'collection') link = '/pages/collections.html';
  if (item.type === 'record') link = '/pages/records.html';
  if (item.type === 'file') link = '/pages/files.html';
  if (item.type === 'webhook') link = '/pages/webhooks.html';

  return `
    <div class="list-card">
      <strong>${item.name || 'Result'}</strong><br>
      <span class="muted">${item.type || 'unknown'}</span><br>
      <span class="muted">${item.subtitle || ''}</span><br>
      <a href="${link}" class="ghost-btn">Open</a>
    </div>
  `;
}

async function runSearch(q, resultsDiv) {
  if (!q) {
    resultsDiv.innerHTML = `<div class="muted">Start typing to search...</div>`;
    return;
  }

  resultsDiv.innerHTML = window.USGEnhancedUI
    ? window.USGEnhancedUI.loadingCard('Searching...')
    : `<div class="muted">Searching...</div>`;

  try {
    const data = await search(q);

    if (!data.results || !data.results.length) {
      resultsDiv.innerHTML = window.USGEnhancedUI
        ? window.USGEnhancedUI.emptyCard('No results found', 'Try another keyword.')
        : `<div class="muted">No results</div>`;
      return;
    }

    resultsDiv.innerHTML = `
      <div class="muted" style="margin-bottom:12px">Found ${data.count || data.results.length} result(s)</div>
      ${data.results.map(resultCard).join('')}
    `;
  } catch (error) {
    resultsDiv.innerHTML = `<div class="muted">Search failed: ${error.message}</div>`;
  }
}

async function render() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'TOOLS',
    title: 'Global Search',
    subtitle: 'Search across the entire data server'
  });

  content.innerHTML = `
    <section class="card">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <input id="search-box" placeholder="Search anything..." style="flex:1;min-width:260px;padding:12px;font-size:16px">
        <button id="search-run-btn" class="primary-btn" type="button">Search</button>
      </div>
    </section>

    <section id="results" class="card" style="margin-top:20px">
      <div class="muted">Start typing to search...</div>
    </section>
  `;

  const input = document.getElementById('search-box');
  const resultsDiv = document.getElementById('results');
  const runBtn = document.getElementById('search-run-btn');
  const initialQuery = getInitialQuery();

  input.value = initialQuery;

  async function go() {
    const q = input.value.trim();
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
    await runSearch(q, resultsDiv);
  }

  input.oninput = async () => {
    const q = input.value.trim();
    if (!q) {
      resultsDiv.innerHTML = `<div class="muted">Start typing to search...</div>`;
      return;
    }
    await runSearch(q, resultsDiv);
  };

  input.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      await go();
    }
  });

  runBtn.onclick = go;

  if (initialQuery) {
    await runSearch(initialQuery, resultsDiv);
  }
}

render();
