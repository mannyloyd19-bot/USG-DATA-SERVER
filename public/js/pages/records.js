window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

let currentCollectionId = '';

function parseDataObject(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return null;
  }
}

function validateRecord(data) {
  const errors = [];
  if (!currentCollectionId) errors.push('Select a collection first');
  const parsed = parseDataObject(data.data);
  if (!parsed || typeof parsed !== 'object') errors.push('Data must be valid JSON');
  return errors;
}

async function fetchCollections() {
  const res = await apiFetch('/api/collections');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.collections || []);
}

function recordCard(item) {
  return `
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
  `;
}

async function loadRecords() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATA',
    title: 'Records',
    subtitle: 'Manage records per collection'
  });

  const collections = await fetchCollections().catch(() => []);
  if (!currentCollectionId && collections.length) {
    currentCollectionId = collections[0].id;
  }

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Record Controls</h2>
      </div>
      <div class="actions" style="gap:10px;flex-wrap:wrap">
        <select id="record-collection-select" style="min-width:220px">
          ${collections.map(c => `<option value="${c.id}" ${String(c.id) === String(currentCollectionId) ? 'selected' : ''}>${c.name || c.key}</option>`).join('')}
        </select>
        <button id="create-record-btn" class="primary-btn" type="button">+ Create Record</button>
        <button id="refresh-records-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  const select = document.getElementById('record-collection-select');
  if (select) {
    select.onchange = () => {
      currentCollectionId = select.value;
      loadRecords();
    };
  }

  document.getElementById('refresh-records-btn').onclick = () => loadRecords();

  document.getElementById('create-record-btn').onclick = () => {
    if (!currentCollectionId) {
      USGIOSAlert.show({ title: 'Records', message: 'Create a collection first.', type: 'error' });
      return;
    }

    USGCrudKit.create({
      title: 'Create Record',
      endpoint: '/api/records',
      validate: validateRecord,
      transform: (payload) => ({
        collectionId: currentCollectionId,
        data: parseDataObject(payload.data)
      }),
      fields: [
        { name: 'data', label: 'Data JSON' }
      ],
      onDone: () => loadRecords()
    });
  };

  if (!currentCollectionId) {
    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';
    wrap.innerHTML = USGPageKit.emptyState({ title: 'No collections found' });
    content.appendChild(wrap);
    return;
  }

  try {
    const res = await apiFetch('/api/records');
    const data = await res.json();
    const rows = (Array.isArray(data) ? data : (data.records || data.data || []))
      .filter(r => String(r.collectionId) === String(currentCollectionId));

    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';
    wrap.innerHTML = `
      <div class="kicker">RECORDS</div>
      <h2>Collection Records</h2>
      ${rows.length ? rows.map(recordCard).join('') : USGPageKit.emptyState({ title: 'No records found' })}
    `;
    content.appendChild(wrap);

    rows.forEach(item => {
      const editBtn = document.querySelector(`[data-edit-record="${item.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit Record',
          endpoint: `/api/records/${item.id}`,
          validate: validateRecord,
          transform: (payload) => ({
            collectionId: currentCollectionId,
            data: parseDataObject(payload.data)
          }),
          initial: {
            data: JSON.stringify(item.data || {}, null, 2)
          },
          fields: [
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
