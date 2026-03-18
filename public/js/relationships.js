requireAuth();

const formEl = document.getElementById('relationship-form');
const listEl = document.getElementById('relationship-list');
const sourceTableEl = document.getElementById('source-table');
const targetTableEl = document.getElementById('target-table');
const sourceColumnEl = document.getElementById('source-column');
const targetColumnEl = document.getElementById('target-column');

async function loadTablesIntoSelects() {
  try {
    const res = await apiFetch('/api/relational/tables');
    const tables = await res.json();

    const options = '<option value="">Select table</option>' + tables.map(t => `
      <option value="${t.key}">${t.name} (${t.key})</option>
    `).join('');

    sourceTableEl.innerHTML = options;
    targetTableEl.innerHTML = options;
  } catch (error) {
    sourceTableEl.innerHTML = '<option value="">Failed to load tables</option>';
    targetTableEl.innerHTML = '<option value="">Failed to load tables</option>';
  }
}

async function loadColumns(tableKey, targetSelect) {
  if (!tableKey) {
    targetSelect.innerHTML = '<option value="">Select column</option>';
    return;
  }

  try {
    const res = await apiFetch(`/api/relational/tables/${tableKey}/columns`);
    const columns = await res.json();

    targetSelect.innerHTML = '<option value="">Select column</option>' + columns.map(c => `
      <option value="${c.key}">${c.name} (${c.key})</option>
    `).join('');
  } catch (error) {
    targetSelect.innerHTML = '<option value="">Failed to load columns</option>';
  }
}

sourceTableEl.addEventListener('change', () => loadColumns(sourceTableEl.value, sourceColumnEl));
targetTableEl.addEventListener('change', () => loadColumns(targetTableEl.value, targetColumnEl));

async function loadRelationships() {
  listEl.innerHTML = '<div class="muted">Loading relationships...</div>';

  try {
    const res = await apiFetch('/api/relationships');
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      listEl.innerHTML = '<div class="muted">No relationships defined yet.</div>';
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="item-card">
        <div><strong>${item.name}</strong></div>
        <div class="muted">${item.relationType}</div>
        <div class="muted">${item.sourceTableKey}.${item.sourceColumnKey} → ${item.targetTableKey}.${item.targetColumnKey}</div>
        <div class="muted">onDelete: ${item.onDelete}</div>
      </div>
    `).join('');
  } catch (error) {
    listEl.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('relationship-name').value.trim(),
    sourceTableKey: sourceTableEl.value,
    sourceColumnKey: sourceColumnEl.value,
    targetTableKey: targetTableEl.value,
    targetColumnKey: targetColumnEl.value,
    relationType: document.getElementById('relationship-type').value,
    onDelete: document.getElementById('relationship-ondelete').value,
    description: document.getElementById('relationship-description').value.trim()
  };

  try {
    const res = await apiFetch('/api/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create relationship');

    formEl.reset();
    sourceColumnEl.innerHTML = '<option value="">Select column</option>';
    targetColumnEl.innerHTML = '<option value="">Select column</option>';
    loadRelationships();
  } catch (error) {
    alert(error.message);
  }
});

loadTablesIntoSelects();
loadRelationships();
