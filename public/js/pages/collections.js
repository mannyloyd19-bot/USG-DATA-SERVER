requireAuth();
USGShell.buildShell();

function validateCollection(data) {
  return USGValidationKit.collect(
    USGValidationKit.required(data.name, 'Collection Name'),
    USGValidationKit.required(data.key, 'Collection Key'),
    USGValidationKit.required(data.tableName, 'Table Name')
  );
}

async function loadCollections() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATABASE',
    title: 'Collections',
    subtitle: 'Manage data collections and schemas'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Collection Controls</h2>
      </div>
      <div class="actions">
        <button id="create-collection-btn" class="primary-btn" type="button">+ Create Collection</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('create-collection-btn').onclick = () => USGCrudKit.create({
    title: 'Create Collection',
    endpoint: '/api/collections',
    validate: validateCollection,
    fields: [
      { name: 'name', label: 'Collection Name' },
      { name: 'key', label: 'Collection Key' },
      { name: 'tableName', label: 'Table Name' }
    ],
    onDone: () => loadCollections()
  });

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search collections...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/collections');
    const data = await res.json();
    const rows = data.collections || [];

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(c => `
      <div class="list-card">
        <strong>${c.name || c.key}</strong><br>
        <span class="muted">Key: ${c.key || ''}</span><br>
        <span class="muted">Table: ${c.tableName || '-'}</span>
        <div class="actions">
          <a class="ghost-btn" href="/pages/fields.html" type="button">Fields</a>
          <button class="ghost-btn" data-edit="${c.id}" type="button">Edit</button>
          <button class="danger-btn" data-delete="${c.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No collections found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});

    rows.forEach(c => {
      const editBtn = document.querySelector(`[data-edit="${c.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit Collection',
          endpoint: `/api/collections/${c.id}`,
          validate: validateCollection,
          initial: {
            name: c.name || '',
            key: c.key || '',
            tableName: c.tableName || ''
          },
          fields: [
            { name: 'name', label: 'Collection Name' },
            { name: 'key', label: 'Collection Key' },
            { name: 'tableName', label: 'Table Name' }
          ],
          onDone: () => loadCollections()
        });
      }

      const delBtn = document.querySelector(`[data-delete="${c.id}"]`);
      if (delBtn) {
        delBtn.onclick = () => USGCrudKit.remove({
          title: 'Delete Collection',
          message: 'Delete this collection?',
          endpoint: `/api/collections/${c.id}`,
          onDone: () => loadCollections()
        });
      }
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'Collections Error', message: err.message, type: 'error' });
  }
}
loadCollections();
