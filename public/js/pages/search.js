requireAuth();
USGShell.buildShell();

async function search(q) {
  const res = await apiFetch('/api/search/global?q=' + encodeURIComponent(q));
  return await res.json();
}

function resultCard(item) {
  let link = '#';

  if (item.type === 'user') link = '/pages/users.html';
  if (item.type === 'collection') link = '/pages/collections.html';
  if (item.type === 'record') link = '/pages/records.html';
  if (item.type === 'file') link = '/pages/files.html';
  if (item.type === 'notification') link = '/pages/notifications.html';

  return `
    <div class="list-card">
      <strong>${item.name}</strong><br>
      <span class="muted">${item.type}</span><br>
      <a href="${link}" class="ghost-btn">Open</a>
    </div>
  `;
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
      <input id="search-box" placeholder="Search anything..." style="width:100%;padding:12px;font-size:16px">
    </section>

    <section id="results" class="card" style="margin-top:20px">
      <div class="muted">Start typing to search...</div>
    </section>
  `;

  const input = document.getElementById('search-box');
  const resultsDiv = document.getElementById('results');

  input.oninput = async () => {
    const q = input.value;

    if (!q) {
      resultsDiv.innerHTML = `<div class="muted">Start typing to search...</div>`;
      return;
    }

    resultsDiv.innerHTML = `<div class="muted">Searching...</div>`;

    const data = await search(q);

    if (!data.results.length) {
      resultsDiv.innerHTML = `<div class="muted">No results</div>`;
      return;
    }

    resultsDiv.innerHTML = data.results.map(resultCard).join('');
  };
}

render();
