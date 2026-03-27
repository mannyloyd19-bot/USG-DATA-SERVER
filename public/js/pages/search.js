requireAuth();
USGShell.buildShell();

async function search(q) {
  const res = await apiFetch('/api/search/global?q=' + encodeURIComponent(q));
  return await res.json();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveLink(item) {
  if (item.link) return item.link;
  if (item.type === 'user') return '/pages/users.html';
  if (item.type === 'collection') return '/pages/collections.html';
  if (item.type === 'record') return '/pages/records.html';
  if (item.type === 'file') return '/pages/files.html';
  if (item.type === 'tenant') return '/pages/tenants.html';
  if (item.type === 'notification') return '/pages/notifications.html';
  return '#';
}

function resultCard(item) {
  const link = resolveLink(item);
  return `
    <div class="list-card">
      <strong>${escapeHtml(item.name)}</strong><br>
      <span class="muted">${escapeHtml(item.type)}</span><br>
      ${item.subtitle ? `<div class="muted" style="margin:6px 0 10px 0">${escapeHtml(item.subtitle)}</div>` : ''}
      <a href="${link}" class="ghost-btn">Open</a>
    </div>
  `;
}

async function render() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'TOOLS',
    title: 'Global Search',
    subtitle: 'Search across users, collections, records, files, and tenants'
  });

  content.innerHTML = `
    <section class="card">
      <input id="search-box" placeholder="Search anything..." style="width:100%;padding:12px;font-size:16px">
    </section>

    <section id="results" class="card" style="margin-top:20px">
      <div class="muted">Start typing to search...</div>
    </section>
  `;

  const input = document.getElementById('search-box');
  const resultsDiv = document.getElementById('results');

  let currentToken = 0;

  input.oninput = async () => {
    const q = input.value.trim();
    const token = ++currentToken;

    if (!q) {
      resultsDiv.innerHTML = `<div class="muted">Start typing to search...</div>`;
      return;
    }

    resultsDiv.innerHTML = `<div class="muted">Searching...</div>`;

    try {
      const data = await search(q);

      if (token !== currentToken) return;

      if (!data.results || !data.results.length) {
        resultsDiv.innerHTML = `<div class="muted">No results</div>`;
        return;
      }

      resultsDiv.innerHTML = `
        <div class="muted" style="margin-bottom:12px">Found ${data.count} result(s)</div>
        ${data.results.map(resultCard).join('')}
      `;
    } catch (error) {
      if (token !== currentToken) return;
      resultsDiv.innerHTML = `<div class="muted">Search failed</div>`;
    }
  };
}

render();
