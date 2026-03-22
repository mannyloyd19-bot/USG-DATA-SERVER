window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function copyText(value, title = 'Copied') {
  try {
    await navigator.clipboard.writeText(value || '');
    USGIOSAlert.show({ title: 'Copied', message: title });
  } catch {
    USGIOSAlert.show({ title: 'Copy Failed', message: title, type: 'error' });
  }
}

async function loadWebhooks() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'WEBHOOKS',
    title: 'Webhooks',
    subtitle: 'Manage outbound event delivery endpoints'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Webhook Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-webhooks-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-webhooks-btn').onclick = () => loadWebhooks();

  try {
    const res = await apiFetch('/api/webhooks');
    const data = await res.json();
    const rows = data.webhooks || data.data || [];

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.event || 'Webhook'}</strong><br>
        <span class="muted">${item.url || item.endpoint || ''}</span><br>
        <div class="actions">
          ${USGPageKit.statusBadge(item.status || 'active')}
          ${(item.url || item.endpoint) ? `<button class="ghost-btn" data-copy-hook="${item.url || item.endpoint}" type="button">Copy URL</button>` : ''}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No webhooks found' });

    content.appendChild(listWrap);

    document.querySelectorAll('[data-copy-hook]').forEach(btn => {
      btn.onclick = () => copyText(btn.dataset.copyHook, 'Webhook URL copied');
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'Webhooks Error', message: err.message, type: 'error' });
  }
}
loadWebhooks();
