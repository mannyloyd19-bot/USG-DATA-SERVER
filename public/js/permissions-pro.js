requireAuth();

const roleSelect = document.getElementById('pm-role');
const matrixBox = document.getElementById('pm-matrix');
const saveBtn = document.getElementById('pm-save');

let currentMatrix = null;
let currentModules = [];
let currentActions = [];

async function loadMatrix() {
  matrixBox.innerHTML = '<div class="muted">Loading permission matrix...</div>';

  try {
    const res = await apiFetch(`/api/permission-matrix?role=${encodeURIComponent(roleSelect.value)}`);
    const data = await res.json();

    currentMatrix = data.matrix || {};
    currentModules = data.modules || [];
    currentActions = data.actions || [];

    const table = document.createElement('table');
    table.className = 'matrix-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Module</th>${currentActions.map(a => `<th>${a}</th>`).join('')}</tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (const mod of currentModules) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${mod}</strong></td>` + currentActions.map(action => {
        const checked = currentMatrix?.[mod]?.[action] ? 'checked' : '';
        return `<td><input type="checkbox" data-module="${mod}" data-action="${action}" ${checked}></td>`;
      }).join('');
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    matrixBox.innerHTML = '';
    matrixBox.appendChild(table);
  } catch (error) {
    matrixBox.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

saveBtn.addEventListener('click', async () => {
  const matrix = {};

  document.querySelectorAll('#pm-matrix input[type="checkbox"]').forEach(input => {
    const mod = input.getAttribute('data-module');
    const action = input.getAttribute('data-action');
    if (!matrix[mod]) matrix[mod] = {};
    matrix[mod][action] = input.checked;
  });

  try {
    const res = await apiFetch('/api/permission-matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: roleSelect.value,
        matrix
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save permissions');
    alert('Permission matrix saved successfully.');
  } catch (error) {
    alert(error.message);
  }
});

roleSelect.addEventListener('change', loadMatrix);
loadMatrix();
