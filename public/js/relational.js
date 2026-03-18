requireAuth();

const tableForm = document.getElementById('table-form');
const tableList = document.getElementById('table-list');
const tableSelect = document.getElementById('rel-table-select');
const columnForm = document.getElementById('column-form');
const rowForm = document.getElementById('row-form');
const rowOutput = document.getElementById('row-output');

async function loadTables() {
  tableList.innerHTML = '<div class="muted">Loading tables...</div>';

  try {
    const res = await apiFetch('/api/relational/tables');
    const tables = await res.json();

    if (!Array.isArray(tables) || tables.length === 0) {
      tableList.innerHTML = '<div class="muted">No tables yet.</div>';
      tableSelect.innerHTML = '<option value="">Select table</option>';
      return;
    }

    tableList.innerHTML = tables.map(t => `
      <div class="item-card">
        <div><strong>${t.name}</strong></div>
        <div class="muted">${t.key}</div>
      </div>
    `).join('');

    tableSelect.innerHTML = '<option value="">Select table</option>' + tables.map(t => `
      <option value="${t.key}">${t.name} (${t.key})</option>
    `).join('');
  } catch (error) {
    tableList.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

tableForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('table-name').value.trim(),
    description: document.getElementById('table-description').value.trim()
  };

  try {
    const res = await apiFetch('/api/relational/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create table');

    tableForm.reset();
    loadTables();
  } catch (error) {
    alert(error.message);
  }
});

columnForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tableKey = tableSelect.value;
  if (!tableKey) {
    alert('Select a table first');
    return;
  }

  const payload = {
    name: document.getElementById('column-name').value.trim(),
    type: document.getElementById('column-type').value,
    required: document.getElementById('column-required').checked,
    uniqueValue: document.getElementById('column-unique').checked
  };

  try {
    const res = await apiFetch(`/api/relational/tables/${tableKey}/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create column');

    columnForm.reset();
    alert('Column created successfully.');
  } catch (error) {
    alert(error.message);
  }
});

rowForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tableKey = tableSelect.value;
  if (!tableKey) {
    alert('Select a table first');
    return;
  }

  let rowData;
  try {
    rowData = JSON.parse(document.getElementById('row-json').value);
  } catch {
    alert('Invalid row JSON');
    return;
  }

  try {
    const createRes = await apiFetch(`/api/relational/tables/${tableKey}/rows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: rowData })
    });

    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(createData.message || 'Failed to insert row');

    const listRes = await apiFetch(`/api/relational/tables/${tableKey}/rows`);
    const rows = await listRes.json();

    rowOutput.textContent = JSON.stringify(rows, null, 2);
  } catch (error) {
    rowOutput.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
});

loadTables();
