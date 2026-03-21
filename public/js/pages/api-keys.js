requireAuth();
USGShell.buildShell();

async function loadKeys() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'API',
    title: 'API Keys',
    subtitle: 'Create, rotate, and revoke access keys',
    actions: [
      {
        label: '+ Create Key',
        primary: true,
        onClick: () => USGCrudKit.create({
          title: 'Create API Key',
          endpoint: '/api/api-keys',
          fields: [
            { name: 'name', label: 'Key Name' },
            { name: 'scope', label: 'Scope' },
            { name: 'status', label: 'Status' }
          ],
          onDone: () => loadKeys()
        })
      }
    ]
  });

  try {
    const res = await apiFetch('/api/api-keys');
    const data = await res.json();
    const rows = data.keys || [];

    content.innerHTML += rows.length ? rows.map(k => `
      <div class="list-card">
        <strong>${k.name}</strong><br>
        <span class="muted">Scope: ${k.scope || '-'}</span><br>
        <span class="muted">Last Used: ${k.lastUsed || 'Never'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(k.status || 'active')}
          ${k.key ? USGPageKit.copyButton(k.key, 'Copy Key') : ''}
          <button class="ghost-btn" data-edit="${k.id}">Edit</button>
          <button class="danger-btn" data-delete="${k.id}">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No API keys found' });

    USGPageKit.wireCopyButtons();

    rows.forEach(k => {
      const editBtn = document.querySelector(`[data-edit="${k.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit API Key',
          endpoint: `/api/api-keys/${k.id}`,
          initial: {
            name: k.name || '',
            scope: k.scope || '',
            status: k.status || ''
          },
          fields: [
            { name: 'name', label: 'Key Name' },
            { name: 'scope', label: 'Scope' },
            { name: 'status', label: 'Status' }
          ],
          onDone: () => loadKeys()
        });
      }

      const delBtn = document.querySelector(`[data-delete="${k.id}"]`);
      if (delBtn) {
        delBtn.onclick = () => USGCrudKit.remove({
          title: 'Delete API Key',
          message: 'Delete this API key?',
          endpoint: `/api/api-keys/${k.id}`,
          onDone: () => loadKeys()
        });
      }
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'API Keys Error', message: err.message, type: 'error' });
  }
}
loadKeys();
