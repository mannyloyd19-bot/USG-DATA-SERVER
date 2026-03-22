window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

let currentCollectionKey = '';

function normalizeBool(v) {
  return String(v).toLowerCase() === 'true';
}

function validateField(data) {
  const errors = [];
  if (!currentCollectionKey) errors.push('Select a collection first');
  if (!data.name || !String(data.name).trim()) errors.push('Field name is required');
  if (!data.type || !String(data.type).trim()) errors.push('Field type is required');
  return errors;
}

async function fetchCollections() {
  const res = await apiFetch('/api/collections');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.collections || []);
}

function fieldCard(item) {
  return `
    <div class="list-card">
      <strong>${item.name || item.key || 'Field'}</strong><br>
      <span class="muted">Key: ${item.key || '-'}</span><br>
      <span class="muted">Type: ${item.type || '-'}</span><br>
      <span class="muted">Required: ${item.required ? 'Yes' : 'No'} · Unique: ${item.uniqueValue ? 'Yes' : 'No'}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(item.isActive === false ? 'inactive' : 'active')}
        <button class="ghost-btn" data-edit-field="${item.id}" type="button">Edit</button>
        <button class="danger-btn" data-delete-field="${item.id}" type="button">Delete</button>
      </div>
    </div>
  `;
}

async function loadFields() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATABASE',
    title: 'Fields',
    subtitle: 'Manage schema fields per collection'
  });

  const collections = await fetchCollections().catch(() => []);
  if (!currentCollectionKey && collections.length) {
    currentCollectionKey = collections[0].key;
  }

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Field Controls</h2>
      </div>
      <div class="actions" style="gap:10px;flex-wrap:wrap">
        <select id="field-collection-select" style="min-width:220px">
          ${collections.map(c => `<option value="${c.key}" ${c.key === currentCollectionKey ? 'selected' : ''}>${c.name || c.key}</option>`).join('')}
        </select>
        <button id="create-field-btn" class="primary-btn" type="button">+ Create Field</button>
        <button id="refresh-fields-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  const select = document.getElementById('field-collection-select');
  if (select) {
    select.onchange = () => {
      currentCollectionKey = select.value;
      loadFields();
    };
  }

  document.getElementById('refresh-fields-btn').onclick = () => loadFields();

  document.getElementById('create-field-btn').onclick = () => {
    if (!currentCollectionKey) {
      USGIOSAlert.show({ title: 'Fields', message: 'Create a collection first.', type: 'error' });
      return;
    }

    USGCrudKit.create({
      title: 'Create Field',
      endpoint: `/api/collections/${encodeURIComponent(currentCollectionKey)}/fields`,
      validate: validateField,
      transform: (payload) => ({
        ...payload,
        required: normalizeBool(payload.required),
        uniqueValue: normalizeBool(payload.uniqueValue),
        searchable: normalizeBool(payload.searchable),
        sortable: normalizeBool(payload.sortable)
      }),
      fields: [
        { name: 'name', label: 'Field Name' },
        { name: 'key', label: 'Field Key (optional)' },
        { name: 'type', label: 'Type (TEXT, NUMBER, BOOLEAN, DATE, JSON)' },
        { name: 'required', label: 'Required (true/false)' },
        { name: 'uniqueValue', label: 'Unique (true/false)' },
        { name: 'searchable', label: 'Searchable (true/false)' },
        { name: 'sortable', label: 'Sortable (true/false)' },
        { name: 'defaultValue', label: 'Default Value' }
      ],
      onDone: () => loadFields()
    });
  };

  if (!currentCollectionKey) {
    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';
    wrap.innerHTML = USGPageKit.emptyState({ title: 'No collections found' });
    content.appendChild(wrap);
    return;
  }

  try {
    const res = await apiFetch(`/api/collections/${encodeURIComponent(currentCollectionKey)}/fields`);
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.fields || data.data || []);

    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';
    wrap.innerHTML = `
      <div class="kicker">SCHEMA</div>
      <h2>Fields for ${currentCollectionKey}</h2>
      ${rows.length ? rows.map(fieldCard).join('') : USGPageKit.emptyState({ title: 'No fields found' })}
    `;
    content.appendChild(wrap);

    rows.forEach(item => {
      const editBtn = document.querySelector(`[data-edit-field="${item.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit Field',
          endpoint: `/api/collections/${encodeURIComponent(currentCollectionKey)}/fields/${item.id}`,
          method: 'PATCH',
          validate: validateField,
          transform: (payload) => ({
            ...payload,
            required: normalizeBool(payload.required),
            uniqueValue: normalizeBool(payload.uniqueValue),
            searchable: normalizeBool(payload.searchable),
            sortable: normalizeBool(payload.sortable)
          }),
          initial: {
            name: item.name || '',
            type: item.type || '',
            required: item.required ? 'true' : 'false',
            uniqueValue: item.uniqueValue ? 'true' : 'false',
            searchable: item.searchable ? 'true' : 'false',
            sortable: item.sortable ? 'true' : 'false',
            defaultValue: item.defaultValue ?? ''
          },
          fields: [
            { name: 'name', label: 'Field Name' },
            { name: 'type', label: 'Type' },
            { name: 'required', label: 'Required (true/false)' },
            { name: 'uniqueValue', label: 'Unique (true/false)' },
            { name: 'searchable', label: 'Searchable (true/false)' },
            { name: 'sortable', label: 'Sortable (true/false)' },
            { name: 'defaultValue', label: 'Default Value' }
          ],
          onDone: () => loadFields()
        });
      }

      const delBtn = document.querySelector(`[data-delete-field="${item.id}"]`);
      if (delBtn) {
        delBtn.onclick = () => USGCrudKit.remove({
          title: 'Delete Field',
          message: 'Delete this field?',
          endpoint: `/api/collections/${encodeURIComponent(currentCollectionKey)}/fields/${item.id}`,
          onDone: () => loadFields()
        });
      }
    });
  } catch (error) {
    USGIOSAlert.show({ title: 'Fields Error', message: error.message, type: 'error' });
  }
}

loadFields();
