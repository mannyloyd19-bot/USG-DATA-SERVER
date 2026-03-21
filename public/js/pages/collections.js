requireAuth();
USGShell.buildShell();

async function loadCollections() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATABASE',
    title: 'Collections',
    subtitle: 'Manage data collections and schemas',
    actions: [
      {
        label: '+ Create Collection',
        primary: true,
        onClick: () => USGCrudKit.create({
          title: 'Create Collection',
          endpoint: '/api/collections',
          fields: [
            { name: 'name', label: 'Collection Name' },
            { name: 'key', label: 'Collection Key' },
            { name: 'tableName', label: 'Table Name' }
          ],
          onDone: () => loadCollections()
        })
      }
    ]
  });

  try {
    const res = await apiFetch('/api/collections');
    const data = await res.json();
    const rows = data.collections || [];

    content.innerHTML += rows.length ? rows.map(c => `
      <div class="list-card">
        <strong>${c.name || c.key}</strong><br>
        <span class="muted">${c.key || ''}</span><br>
        <span class="muted">Table: ${c.tableName || '-'}</span>
        <div class="actions">
          <button class="ghost-btn" data-edit="${c.id}">Edit</button>
          <button class="danger-btn" data-delete="${c.id}">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No collections found' });

    rows.forEach(c => {
      const editBtn = document.querySelector(`[data-edit="${c.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit Collection',
          endpoint: `/api/collections/${c.id}`,
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
