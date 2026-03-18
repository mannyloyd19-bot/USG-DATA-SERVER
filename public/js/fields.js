requireAuth();

const collectionSelectEl = document.getElementById('field-collection');
const fieldFormEl = document.getElementById('field-form');
const fieldListEl = document.getElementById('field-list');

async function loadCollectionsForFields() {
  try {
    const res = await apiFetch('/api/collections');
    const collections = await res.json();

    collectionSelectEl.innerHTML = '<option value="">Select collection</option>' + collections.map(c => `
      <option value="${c.key}">${c.name} (${c.key})</option>
    `).join('');
  } catch (error) {
    collectionSelectEl.innerHTML = '<option value="">Failed to load collections</option>';
  }
}

async function loadFields() {
  const collectionKey = collectionSelectEl.value;
  if (!collectionKey) {
    fieldListEl.innerHTML = '<div class="muted">Select a collection.</div>';
    return;
  }

  fieldListEl.innerHTML = '<div class="muted">Loading fields...</div>';

  try {
    const res = await apiFetch(`/api/collections/${collectionKey}/fields`);
    const fields = await res.json();

    if (!Array.isArray(fields) || fields.length === 0) {
      fieldListEl.innerHTML = '<div class="muted">No fields yet.</div>';
      return;
    }

    fieldListEl.innerHTML = fields.map(field => `
      <div class="item-card">
        <div><strong>${field.name}</strong></div>
        <div class="muted">key: ${field.key}</div>
        <div class="muted">type: ${field.type} · required: ${field.required}</div>
      </div>
    `).join('');
  } catch (error) {
    fieldListEl.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

collectionSelectEl.addEventListener('change', loadFields);

fieldFormEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const collectionKey = collectionSelectEl.value;
  if (!collectionKey) {
    alert('Select a collection first');
    return;
  }

  const payload = {
    name: document.getElementById('field-name').value.trim(),
    type: document.getElementById('field-type').value,
    required: document.getElementById('field-required').checked,
    searchable: document.getElementById('field-searchable').checked,
    sortable: document.getElementById('field-sortable').checked
  };

  try {
    const res = await apiFetch(`/api/collections/${collectionKey}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create field');

    fieldFormEl.reset();
    loadFields();
  } catch (error) {
    alert(error.message);
  }
});

loadCollectionsForFields();
