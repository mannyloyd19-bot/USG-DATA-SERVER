window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validateApiKey(data) {
  return USGValidationKit.collect(
    USGValidationKit.required(data.name, 'Key Name'),
    USGValidationKit.required(data.scope, 'Scope'),
    USGValidationKit.required(data.status, 'Status')
  );
}

async function copyText(value, title = 'Copied') {
  try {
    await navigator.clipboard.writeText(value || '');
    USGIOSAlert.show({ title: 'Copied', message: title });
  } catch {
    USGIOSAlert.show({ title: 'Copy Failed', message: title, type: 'error' });
  }
}

async function loadKeys() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'API',
    title: 'API Keys',
    subtitle: 'Create, rotate, and manage integration access keys'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Key Controls</h2>
      </div>
      <div class="actions">
        <button id="create-key-btn" class="primary-btn" type="button">+ Create Key</button>
        <a href="/pages/api-key-logs.html" class="ghost-btn">Logs</a>
        <a href="/pages/api-key-analytics.html" class="ghost-btn">Analytics</a>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('create-key-btn').onclick = () => USGCrudKit.create({
    title: 'Create API Key',
    endpoint: '/api/api-keys',
    validate: validateApiKey,
    fields: [
      { name: 'name', label: 'Key Name' },
      { name: 'scope', label: 'Scope' },
      { name: 'status', label: 'Status' }
    ],
    onDone: () => loadKeys()
  });

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search API keys...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/api-keys');
    const data = await res.json();
    const rows = data.keys || data.apiKeys || [];

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(k => `
      <div class="list-card">
        <strong>${k.name || 'API Key'}</strong><br>
        <span class="muted">Scope: ${k.scope || '-'}</span><br>
        <span class="muted">Last Used: ${k.lastUsed || 'Never'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(k.status || 'active')}
          ${k.key ? `<button class="ghost-btn" data-copy-key="${k.key}" type="button">Copy Key</button>` : ''}
          <button class="ghost-btn" data-edit="${k.id}" type="button">Edit</button>
          <button class="danger-btn" data-delete="${k.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No API keys found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});

    document.querySelectorAll('[data-copy-key]').forEach(btn => {
      btn.onclick = () => copyText(btn.dataset.copyKey, 'API key copied');
    });

    rows.forEach(k => {
      const editBtn = document.querySelector(`[data-edit="${k.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit API Key',
          endpoint: `/api/api-keys/${k.id}`,
          validate: validateApiKey,
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
