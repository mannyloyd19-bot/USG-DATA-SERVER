window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function parseDataObject(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return null;
  }
}

function validateRecord(data) {
  const errors = [];
  if (!data.collectionId || !String(data.collectionId).trim()) errors.push('Collection ID is required');
  const parsed = parseDataObject(data.data);
  if (!parsed || typeof parsed !== 'object') errors.push('Data must be valid JSON');
  return errors;
}

async function loadRecords() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATA',
    title: 'Records',
    subtitle: 'Manage records, payload data, and collection entries'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Record Controls</h2>
      </div>
      <div class="actions">
        <button id="create-record-btn" class="primary-btn" type="button">+ Create Record</button>
        <button id="refresh-records-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-records-btn').onclick = () => loadRecords();
  document.getElementById('create-record-btn').onclick = () => USGCrudKit.create({
    title: 'Create Record',
    endpoint: '/api/records',
    validate: validateRecord,
    transform: (payload) => ({
      ...payload,
      data: parseDataObject(payload.data)
    }),
    fields: [
      { name: 'collectionId', label: 'Collection ID' },
      { name: 'data', label: 'Data JSON' }
    ],
    onDone: () => loadRecords()
  });

  try {
    const res = await apiFetch('/api/records');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.records || data.data || []);

    const wrap = document.createElement('section');
    wrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>Record ${item.id || ''}</strong><br>
        <span class="muted">Collection: ${item.collectionId || '-'}</span><br>
        <pre style="white-space:pre-wrap;margin-top:8px">${JSON.stringify(item.data || {}, null, 2)}</pre>
        <div class="actions">
          ${USGPageKit.statusBadge(item.isDeleted ? 'deleted' : 'active')}
          <button class="ghost-btn" data-edit-record="${item.id}" type="button">Edit</button>
          <button class="danger-btn" data-delete-record="${item.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No records found' });

    content.appendChild(wrap);

    rows.forEach(item => {
      const editBtn = document.querySelector(`[data-edit-record="${item.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit Record',
          endpoint: `/api/records/${item.id}`,
          validate: validateRecord,
          transform: (payload) => ({
            ...payload,
            data: parseDataObject(payload.data)
          }),
          initial: {
            collectionId: item.collectionId || '',
            data: JSON.stringify(item.data || {}, null, 2)
          },
          fields: [
            { name: 'collectionId', label: 'Collection ID' },
            { name: 'data', label: 'Data JSON' }
          ],
          onDone: () => loadRecords()
        });
      }

      const delBtn = document.querySelector(`[data-delete-record="${item.id}"]`);
      if (delBtn) {
        delBtn.onclick = () => USGCrudKit.remove({
          title: 'Delete Record',
          message: 'Delete this record?',
          endpoint: `/api/records/${item.id}`,
          onDone: () => loadRecords()
        });
      }
    });
  } catch (error) {
    USGIOSAlert.show({ title: 'Records Error', message: error.message, type: 'error' });
  }
}

loadRecords();
