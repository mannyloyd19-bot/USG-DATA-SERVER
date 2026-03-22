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

async function loadDeliveries() {
  try {
    const res = await apiFetch('/api/webhook-advanced/deliveries');
    const data = await res.json();
    return data.deliveries || [];
  } catch {
    return [];
  }
}

async function loadWebhooks() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'WEBHOOKS',
    title: 'Webhooks',
    subtitle: 'Manage outbound event delivery endpoints and delivery logs'
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
    const [webhookRes, deliveries] = await Promise.all([
      apiFetch('/api/webhooks'),
      loadDeliveries()
    ]);

    const data = await webhookRes.json();
    const rows = Array.isArray(data) ? data : (data.webhooks || data.data || []);

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.event || 'Webhook'}</strong><br>
        <span class="muted">${item.url || item.endpoint || ''}</span><br>
        <div class="actions">
          ${USGPageKit.statusBadge(item.status || 'active')}
          ${(item.url || item.endpoint) ? `<button class="ghost-btn" data-copy-hook="${item.url || item.endpoint}" type="button">Copy URL</button>` : ''}
          <button class="ghost-btn" data-test-hook="${item.id}" type="button">Test</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No webhooks found' });

    content.appendChild(listWrap);

    const deliveryWrap = document.createElement('section');
    deliveryWrap.className = 'card';
    deliveryWrap.innerHTML = `
      <div class="kicker">DELIVERIES</div>
      <h2>Recent Delivery Logs</h2>
      ${
        deliveries.length
          ? deliveries.slice(0, 20).map(d => `
            <div class="list-card">
              <strong>${d.eventType || 'event'}</strong><br>
              <span class="muted">${d.targetUrl || ''}</span><br>
              <span class="muted">Status: ${d.deliveryStatus || '-'} · HTTP: ${d.responseStatus || '-'}</span>
              <div class="actions">
                ${(d.deliveryStatus || '') === 'failed' ? `<button class="ghost-btn" data-retry-delivery="${d.id}" type="button">Retry</button>` : ''}
              </div>
            </div>
          `).join('')
          : `<div class="muted">No delivery logs yet.</div>`
      }
    `;
    content.appendChild(deliveryWrap);

    document.querySelectorAll('[data-copy-hook]').forEach(btn => {
      btn.onclick = () => copyText(btn.dataset.copyHook, 'Webhook URL copied');
    });

    document.querySelectorAll('[data-test-hook]').forEach(btn => {
      btn.onclick = async () => {
        const res = await apiFetch(`/api/webhook-advanced/${btn.dataset.testHook}/test`, { method: 'POST' });
        const out = await res.json();
        USGIOSAlert.show({
          title: out.success ? 'Webhook Tested' : 'Webhook Test Failed',
          message: out.delivery?.deliveryStatus || out.message || 'Done',
          type: out.success ? 'success' : 'error'
        });
        loadWebhooks();
      };
    });

    document.querySelectorAll('[data-retry-delivery]').forEach(btn => {
      btn.onclick = async () => {
        const res = await apiFetch(`/api/webhook-advanced/deliveries/${btn.dataset.retryDelivery}/retry`, { method: 'POST' });
        const out = await res.json();
        USGIOSAlert.show({
          title: out.success ? 'Retry Sent' : 'Retry Failed',
          message: out.delivery?.deliveryStatus || out.message || 'Done',
          type: out.success ? 'success' : 'error'
        });
        loadWebhooks();
      };
    });

  } catch (err) {
    USGIOSAlert.show({ title: 'Webhooks Error', message: err.message, type: 'error' });
  }
}
loadWebhooks();
