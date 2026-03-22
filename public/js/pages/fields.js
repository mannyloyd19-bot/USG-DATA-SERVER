window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validateField(data) {
  const errors = [];
  if (!data.name || !String(data.name).trim()) errors.push('Field name is required');
  if (!data.key || !String(data.key).trim()) errors.push('Field key is required');
  if (!data.type || !String(data.type).trim()) errors.push('Field type is required');
  if (!data.collectionId || !String(data.collectionId).trim()) errors.push('Collection ID is required');
  return errors;
}

async function loadFields() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATABASE',
    title: 'Fields',
    subtitle: 'Manage collection field definitions and schema structure'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Field Controls</h2>
      </div>
      <div class="actions">
        <button id="create-field-btn" class="primary-btn" type="button">+ Create Field</button>
        <button id="refresh-fields-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-fields-btn').onclick = () => loadFields();
  document.getElementById('create-field-btn').onclick = () => USGCrudKit.create({
    title: 'Create Field',
    endpoint: '/api/fields',
    validate: validateField,
    fields: [
      { name: 'name', label: 'Field Name' },
      { name: 'key', label: 'Field Key' },
      { name: 'type', label: 'Type (text, number, boolean, date, json)' },
      { name: 'collectionId', label: 'Collection ID' },
      { name: 'required', label: 'Required (true/false)' },
      { name: 'defaultValue', label: 'Default Value' }
    ],
    onDone: () => loadFields()
  });

  try {
    const res = await apiFetch('/api/fields');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.fields || data.data || []);

    const wrap = document.createElement('section');
    wrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.key || 'Field'}</strong><br>
        <span class="muted">Key: ${item.key || '-'}</span><br>
        <span class="muted">Type: ${item.type || '-'}</span><br>
        <span class="muted">Collection: ${item.collectionId || '-'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(item.required ? 'required' : 'optional')}
          <button class="ghost-btn" data-edit-field="${item.id}" type="button">Edit</button>
          <button class="danger-btn" data-delete-field="${item.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No fields found' });

    content.appendChild(wrap);

    rows.forEach(item => {
      const editBtn = document.querySelector(`[data-edit-field="${item.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit Field',
          endpoint: `/api/fields/${item.id}`,
          validate: validateField,
          initial: {
            name: item.name || '',
            key: item.key || '',
            type: item.type || '',
            collectionId: item.collectionId || '',
            required: item.required ? 'true' : 'false',
            defaultValue: item.defaultValue || ''
          },
          fields: [
            { name: 'name', label: 'Field Name' },
            { name: 'key', label: 'Field Key' },
            { name: 'type', label: 'Type' },
            { name: 'collectionId', label: 'Collection ID' },
            { name: 'required', label: 'Required (true/false)' },
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
          endpoint: `/api/fields/${item.id}`,
          onDone: () => loadFields()
        });
      }
    });
  } catch (error) {
    USGIOSAlert.show({ title: 'Fields Error', message: error.message, type: 'error' });
  }
}

loadFields();
