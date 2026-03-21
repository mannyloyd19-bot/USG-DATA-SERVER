requireAuth();
USGShell.buildShell();

async function loadKeys() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'API',
    title: 'API Keys',
    subtitle: 'Manage API access keys'
  });

  content.innerHTML += USGPageKit.loadingState();

  const res = await apiFetch('/api/api-keys');
  const data = await res.json();

  content.innerHTML += (data.keys || []).map(k => `
    <div class="list-card">
      <strong>${k.name}</strong><br>
      <span class="muted">Last Used: ${k.lastUsed || 'Never'}</span>
      ${USGPageKit.statusBadge(k.status)}
      <div class="actions">
        ${USGPageKit.copyButton(k.key)}
      </div>
    </div>
  `).join('');

  USGPageKit.wireCopyButtons();
}

loadKeys();
