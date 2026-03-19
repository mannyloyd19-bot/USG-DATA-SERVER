requireAuth();

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

let collectionsCache = [];
let fieldsCache = {};

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

function operatorOptionsHtml() {
  return OPERATOR_OPTIONS.map(op => `<option value="${op.value}">${op.label}</option>`).join('');
}

function createRow(initial = {}) {
  const row = document.createElement('div');
  row.className = 'qb-row';

  row.innerHTML = `
    <select class="qb-field"></select>
    <select class="qb-operator">${operatorOptionsHtml()}</select>
    <input class="qb-value" placeholder="Value">
    <button type="button" class="qb-remove">Remove</button>
  `;

  const fieldSelect = row.querySelector('.qb-field');
  const operatorSelect = row.querySelector('.qb-operator');
  const valueInput = row.querySelector('.qb-value');
  const removeBtn = row.querySelector('.qb-remove');

  populateFieldOptions(fieldSelect);

  if (initial.field) fieldSelect.value = initial.field;
  if (initial.operator) operatorSelect.value = initial.operator;
  if (initial.value !== undefined) valueInput.value = initial.value;

  operatorSelect.addEventListener('change', () => {
    syncValuePlaceholder(operatorSelect, valueInput);
    updatePreview();
  });

  fieldSelect.addEventListener('change', updatePreview);
  valueInput.addEventListener('input', updatePreview);

  removeBtn.addEventListener('click', () => {
    row.remove();
    updatePreview();
  });

  syncValuePlaceholder(operatorSelect, valueInput);
  rowsBox.appendChild(row);
}

function syncValuePlaceholder(operatorSelect, valueInput) {
  const op = operatorSelect.value;
  if (op === 'between') {
    valueInput.placeholder = 'example: 100,500';
  } else if (op === 'in') {
    valueInput.placeholder = 'example: red,blue,green';
  } else if (op === 'exists' || op === 'not_exists') {
    valueInput.placeholder = 'true or false';
  } else {
    valueInput.placeholder = 'Value';
  }
}

function populateFieldOptions(selectEl) {
  const collectionKey = collectionSelect.value;
  const fields = fieldsCache[collectionKey] || [];

  const baseOptions = ['<option value="">Select field</option>'];

  const items = fields.map(f => {
    const key = f.key || '';
    const name = f.name || key;
    return `<option value="${key}">${name} (${key})</option>`;
  });

  selectEl.innerHTML = baseOptions.concat(items).join('');
}

function refreshAllFieldSelects() {
  document.querySelectorAll('.qb-field').forEach(select => {
    const current = select.value;
    populateFieldOptions(select);
    if ([...select.options].some(opt => opt.value === current)) {
      select.value = current;
    }
  });
}

function parseSmartValue(raw, operator) {
  const value = String(raw || '').trim();

  if (operator === 'exists' || operator === 'not_exists') {
    return value === '' ? true : value.toLowerCase() === 'true';
  }

  if (operator === 'between') {
    return value.split(',').map(v => parsePrimitive(v.trim())).filter(v => v !== '');
  }

  if (operator === 'in') {
    return value.split(',').map(v => parsePrimitive(v.trim())).filter(v => v !== '');
  }

  return parsePrimitive(value);
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

function buildFilters() {
  const filters = {};
  const rows = [...document.querySelectorAll('.qb-row')];

  for (const row of rows) {
    const field = row.querySelector('.qb-field').value;
    const operator = row.querySelector('.qb-operator').value;
    const rawValue = row.querySelector('.qb-value').value;

    if (!field || !operator) continue;

    if (!filters[field]) filters[field] = {};
    filters[field][operator] = parseSmartValue(rawValue, operator);
  }

  return filters;
}

function updatePreview() {
  const preview = {
    collection: collectionSelect.value || null,
    search: searchInput.value.trim() || '',
    sortBy: sortByInput.value.trim() || '',
    sortOrder: sortOrderSelect.value,
    limit: Number(limitInput.value || 10),
    filters: buildFilters()
  };

  previewBox.textContent = JSON.stringify(preview, null, 2);
}

async function loadCollections() {
  const res = await apiFetch('/api/collections');
  const data = await res.json();

  collectionsCache = Array.isArray(data) ? data : [];

  collectionSelect.innerHTML = '<option value="">Select collection</option>' + collectionsCache.map(c => {
    return `<option value="${c.key}">${c.name} (${c.key})</option>`;
  }).join('');
}

async function loadFields(collectionKey) {
  if (!collectionKey) {
    fieldsCache[collectionKey] = [];
    refreshAllFieldSelects();
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

  refreshAllFieldSelects();
  updatePreview();
}

function renderResults(payload) {
  resultBox.textContent = JSON.stringify(payload, null, 2);
}

async function runQuery() {
  const collectionKey = collectionSelect.value;
  if (!collectionKey) {
    alert('Select a collection first');
    return;
  }

  const filters = buildFilters();
  const params = new URLSearchParams();

  if (Object.keys(filters).length) {
    params.set('filters', JSON.stringify(filters));
  }

  if (searchInput.value.trim()) {
    params.set('search', searchInput.value.trim());
  }

  if (sortByInput.value.trim()) {
    params.set('sortBy', sortByInput.value.trim());
  }

  if (sortOrderSelect.value) {
    params.set('sortOrder', sortOrderSelect.value);
  }

  params.set('limit', String(Number(limitInput.value || 10)));

  resultBox.textContent = 'Loading query results...';

  try {
    const res = await apiFetch(`/api/collections/${encodeURIComponent(collectionKey)}/records?${params.toString()}`);
    const data = await res.json();
    renderResults(data);
  } catch (error) {
    renderResults({ success: false, message: error.message });
  }
}

collectionSelect.addEventListener('change', async () => {
  await loadFields(collectionSelect.value);
});

searchInput.addEventListener('input', updatePreview);
sortByInput.addEventListener('input', updatePreview);
sortOrderSelect.addEventListener('change', updatePreview);
limitInput.addEventListener('input', updatePreview);

addRowBtn.addEventListener('click', () => {
  createRow();
  updatePreview();
});

runBtn.addEventListener('click', runQuery);

(async function init() {
  await loadCollections();
  createRow();
  updatePreview();
})();
