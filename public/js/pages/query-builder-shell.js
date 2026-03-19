requireAuth();
USGShell.buildShell();

const OPERATOR_OPTIONS = [
  { value: 'eq', label: 'equals' },
  { value: 'ne', label: 'not equals' },
  { value: 'gt', label: 'greater than' },
  { value: 'gte', label: 'greater or equal' },
  { value: 'lt', label: 'less than' },
  { value: 'lte', label: 'less or equal' },
  { value: 'contains', label: 'contains' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
  { value: 'exists', label: 'exists' },
  { value: 'not_exists', label: 'not exists' },
  { value: 'between', label: 'between' },
  { value: 'in', label: 'in list' }
];

let fieldsCache = {};

function operatorOptionsHtml() {
  return OPERATOR_OPTIONS.map(op => `<option value="${op.value}">${op.label}</option>`).join('');
}
function parsePrimitive(value) {
  if (value === '') return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
  try {
    if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
      return JSON.parse(value);
    }
  } catch {}
  return value;
}
function parseSmartValue(raw, operator) {
  const value = String(raw || '').trim();
  if (operator === 'exists' || operator === 'not_exists') return value === '' ? true : value.toLowerCase() === 'true';
  if (operator === 'between' || operator === 'in') return value.split(',').map(v => parsePrimitive(v.trim())).filter(v => v !== '');
  return parsePrimitive(value);
}

async function initQB() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2-wide">
      <section class="card">
        <div class="kicker">VISUAL QUERY</div>
        <h2>Query Builder</h2>

        <div class="row-top">
          <select id="qb-collection"></select>
          <input id="qb-search" placeholder="Global search">
        </div>

        <div class="row-top">
          <input id="qb-sort-by" placeholder="Sort by field">
          <select id="qb-sort-order">
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
        </div>

        <input id="qb-limit" type="number" value="10" min="1" placeholder="Limit">
        <div id="qb-rows"></div>

        <div class="actions">
          <button class="primary-btn" type="button" id="qb-add-row">Add Filter</button>
          <button class="primary-btn" type="button" id="qb-run">Run Query</button>
        </div>
      </section>

      <section class="card">
        <div class="kicker">PREVIEW</div>
        <h2>Generated Query</h2>
        <pre id="qb-preview">Loading...</pre>
        <div class="kicker" style="margin-top:18px">RESULTS</div>
        <h2>Query Results</h2>
        <pre id="qb-results">No query executed yet.</pre>
      </section>
    </div>
  `;

  const collectionSelect = document.getElementById('qb-collection');
  const rowsBox = document.getElementById('qb-rows');
  const addRowBtn = document.getElementById('qb-add-row');
  const runBtn = document.getElementById('qb-run');
  const previewBox = document.getElementById('qb-preview');
  const resultBox = document.getElementById('qb-results');
  const searchInput = document.getElementById('qb-search');
  const sortByInput = document.getElementById('qb-sort-by');
  const sortOrderSelect = document.getElementById('qb-sort-order');
  const limitInput = document.getElementById('qb-limit');

  function populateFieldOptions(selectEl) {
    const collectionKey = collectionSelect.value;
    const fields = fieldsCache[collectionKey] || [];
    selectEl.innerHTML = '<option value="">Select field</option>' + fields.map(f => {
      const key = f.key || '';
      const name = f.name || key;
      return `<option value="${key}">${name} (${key})</option>`;
    }).join('');
  }

  function syncValuePlaceholder(operatorSelect, valueInput) {
    const op = operatorSelect.value;
    if (op === 'between') valueInput.placeholder = 'example: 100,500';
    else if (op === 'in') valueInput.placeholder = 'example: red,blue,green';
    else if (op === 'exists' || op === 'not_exists') valueInput.placeholder = 'true or false';
    else valueInput.placeholder = 'Value';
  }

  function createRow() {
    const row = document.createElement('div');
    row.className = 'qb-row';
    row.innerHTML = `
      <select class="qb-field"></select>
      <select class="qb-operator">${operatorOptionsHtml()}</select>
      <input class="qb-value" placeholder="Value">
      <button type="button" class="danger-btn qb-remove">Remove</button>
    `;

    const fieldSelect = row.querySelector('.qb-field');
    const operatorSelect = row.querySelector('.qb-operator');
    const valueInput = row.querySelector('.qb-value');

    populateFieldOptions(fieldSelect);
    syncValuePlaceholder(operatorSelect, valueInput);

    operatorSelect.addEventListener('change', () => {
      syncValuePlaceholder(operatorSelect, valueInput);
      updatePreview();
    });
    fieldSelect.addEventListener('change', updatePreview);
    valueInput.addEventListener('input', updatePreview);
    row.querySelector('.qb-remove').addEventListener('click', () => {
      row.remove();
      updatePreview();
    });

    rowsBox.appendChild(row);
  }

  function buildFilters() {
    const filters = {};
    [...document.querySelectorAll('.qb-row')].forEach(row => {
      const field = row.querySelector('.qb-field').value;
      const operator = row.querySelector('.qb-operator').value;
      const rawValue = row.querySelector('.qb-value').value;
      if (!field || !operator) return;
      if (!filters[field]) filters[field] = {};
      filters[field][operator] = parseSmartValue(rawValue, operator);
    });
    return filters;
  }

  function updatePreview() {
    previewBox.textContent = JSON.stringify({
      collection: collectionSelect.value || null,
      search: searchInput.value.trim() || '',
      sortBy: sortByInput.value.trim() || '',
      sortOrder: sortOrderSelect.value,
      limit: Number(limitInput.value || 10),
      filters: buildFilters()
    }, null, 2);
  }

  async function loadCollections() {
    const res = await apiFetch('/api/collections');
    const data = await res.json();
    const collections = Array.isArray(data) ? data : [];
    collectionSelect.innerHTML = '<option value="">Select collection</option>' + collections.map(c => {
      return `<option value="${c.key}">${c.name} (${c.key})</option>`;
    }).join('');
  }

  async function loadFields(collectionKey) {
    if (!collectionKey) {
      fieldsCache[collectionKey] = [];
      document.querySelectorAll('.qb-field').forEach(populateFieldOptions);
      updatePreview();
      return;
    }

    try {
      const res = await apiFetch(`/api/collections/${encodeURIComponent(collectionKey)}/fields`);
      const data = await res.json();
      fieldsCache[collectionKey] = Array.isArray(data) ? data : [];
    } catch {
      fieldsCache[collectionKey] = [];
    }

    document.querySelectorAll('.qb-field').forEach(populateFieldOptions);
    updatePreview();
  }

  async function runQuery() {
    const collectionKey = collectionSelect.value;
    if (!collectionKey) {
      alert('Select a collection first');
      return;
    }

    const filters = buildFilters();
    const params = new URLSearchParams();
    if (Object.keys(filters).length) params.set('filters', JSON.stringify(filters));
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    if (sortByInput.value.trim()) params.set('sortBy', sortByInput.value.trim());
    if (sortOrderSelect.value) params.set('sortOrder', sortOrderSelect.value);
    params.set('limit', String(Number(limitInput.value || 10)));

    resultBox.textContent = 'Loading query results...';

    try {
      const res = await apiFetch(`/api/collections/${encodeURIComponent(collectionKey)}/records?${params.toString()}`);
      const data = await res.json();
      resultBox.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      resultBox.textContent = JSON.stringify({ success: false, message: error.message }, null, 2);
    }
  }

  collectionSelect.addEventListener('change', async () => loadFields(collectionSelect.value));
  searchInput.addEventListener('input', updatePreview);
  sortByInput.addEventListener('input', updatePreview);
  sortOrderSelect.addEventListener('change', updatePreview);
  limitInput.addEventListener('input', updatePreview);
  addRowBtn.addEventListener('click', () => { createRow(); updatePreview(); });
  runBtn.addEventListener('click', runQuery);

  await loadCollections();
  createRow();
  updatePreview();
  USGShell.setupRawToggles(content);
}

initQB();
