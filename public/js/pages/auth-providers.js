window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validateProvider(data) {
  return USGValidationKit.collect(
    USGValidationKit.required(data.providerKey, 'Provider Key'),
    USGValidationKit.required(data.displayName, 'Display Name')
  );
}

async function loadProviders() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'AUTH',
    title: 'Auth Providers',
    subtitle: 'Manage Google, Facebook, GitHub, Microsoft, and other login providers'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Provider Controls</h2>
      </div>
      <div class="actions">
        <button id="seed-provider-btn" class="ghost-btn" type="button">Seed Defaults</button>
        <button id="create-provider-btn" class="primary-btn" type="button">+ Add / Update Provider</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('seed-provider-btn').onclick = async () => {
    await apiFetch('/api/auth-providers/seed-defaults', { method: 'POST' });
    loadProviders();
  };

  document.getElementById('create-provider-btn').onclick = () => USGCrudKit.create({
    title: 'Add / Update Provider',
    endpoint: '/api/auth-providers/upsert',
    validate: validateProvider,
    fields: [
      { name: 'providerKey', label: 'Provider Key (google/facebook/github/microsoft)' },
      { name: 'displayName', label: 'Display Name' },
      { name: 'enabled', label: 'Enabled (true/false)' },
      { name: 'clientId', label: 'Client ID' },
      { name: 'clientSecret', label: 'Client Secret' },
      { name: 'callbackUrl', label: 'Callback URL' },
      { name: 'scopes', label: 'Scopes (space/comma separated)' }
    ],
    onDone: () => loadProviders()
  });

  try {
    const res = await apiFetch('/api/auth-providers');
    const data = await res.json();
    const rows = data.providers || [];

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.displayName}</strong><br>
        <span class="muted">Key: ${item.providerKey}</span><br>
        <span class="muted">Enabled: ${item.enabled ? 'true' : 'false'}</span><br>
        <span class="muted">Callback: ${item.callbackUrl || '-'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(item.enabled ? 'enabled' : 'disabled')}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No providers found' });

    content.appendChild(listWrap);
  } catch (error) {
    USGIOSAlert.show({ title: 'Providers Error', message: error.message, type: 'error' });
  }
}
loadProviders();
