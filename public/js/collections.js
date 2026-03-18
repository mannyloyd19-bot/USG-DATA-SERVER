requireAuth();

const listEl = document.getElementById('collection-list');
const formEl = document.getElementById('collection-form');
const recordFormEl = document.getElementById('record-form');
const resultEl = document.getElementById('query-result');
const activeCollectionEl = document.getElementById('active-collection');
const queryInfoEl = document.getElementById('query-info');

let activeCollectionKey = '';

async function loadCollections() {
  listEl.innerHTML = '<div class="muted">Loading collections...</div>';

  try {
    const res = await apiFetch('/api/collections');
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      listEl.innerHTML = '<div class="muted">No collections yet.</div>';
      return;
    }

    listEl.innerHTML = items.map(item => `
      <button class="list-btn" data-key="${item.key}">
        <strong>${item.name}</strong><br>
        <span class="muted">${item.key}</span>
      </button>
    `).join('');

    listEl.querySelectorAll('[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCollectionKey = btn.getAttribute('data-key');
        activeCollectionEl.textContent = activeCollectionKey;
        runQuery();
      });
    });

    if (!activeCollectionKey) {
      activeCollectionKey = items[0].key;
      activeCollectionEl.textContent = activeCollectionKey;
      runQuery();
    }
  } catch (error) {
    listEl.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('collection-name').value.trim(),
    description: document.getElementById('collection-description').value.trim(),
    schemaMode: document.getElementById('collection-schema-mode').value
  };

  try {
    const res = await apiFetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create collection');

    formEl.reset();
    activeCollectionKey = data.key;
    await loadCollections();
  } catch (error) {
    alert(error.message);
  }
});

recordFormEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!activeCollectionKey) {
    alert('Select a collection first');
    return;
  }

  let data;
  try {
    data = JSON.parse(document.getElementById('record-json').value);
  } catch {
    alert('Invalid JSON');
    return;
  }

  try {
    const res = await apiFetch(`/api/collections/${activeCollectionKey}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });

    const out = await res.json();
    if (!res.ok) throw new Error(out.message || 'Failed to create record');

    runQuery();
  } catch (error) {
    alert(error.message);
  }
});

async function runQuery() {
  if (!activeCollectionKey) {
    resultEl.textContent = 'Select a collection first';
    return;
  }

  const search = encodeURIComponent(document.getElementById('query-search').value.trim());
  const sortBy = encodeURIComponent(document.getElementById('query-sortBy').value.trim());
  const sortOrder = encodeURIComponent(document.getElementById('query-sortOrder').value);
  const limit = encodeURIComponent(document.getElementById('query-limit').value.trim() || '10');
  const filtersText = document.getElementById('query-filters').value.trim();
  const selectText = document.getElementById('query-select').value.trim();

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);
  if (limit) params.set('limit', limit);
  if (filtersText) params.set('filters', filtersText);
  if (selectText) params.set('select', selectText);

  queryInfoEl.textContent = `/api/collections/${activeCollectionKey}/records?${params.toString()}`;

  try {
    const res = await apiFetch(`/api/collections/${activeCollectionKey}/records?${params.toString()}`);
    const data = await res.json();
    resultEl.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    resultEl.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}

document.getElementById('run-query').addEventListener('click', runQuery);
loadCollections();
