window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function safeJson(url, options) {
  const res = await apiFetch(url, options || {});
  const out = await res.json();
  if (!res.ok) {
    throw new Error(out.message || 'Request failed');
  }
  return out;
}

function hookCard(item) {
  return `
    <div class="list-card">
      <strong>${item.name || 'Webhook'}</strong><br>
      <span class="muted">${item.event || '-'}</span><br>
      <span class="muted">${item.url || '-'}</span>
      <div class="actions">
        <button class="ghost-btn" data-test-hook="${item.id}" type="button">Test</button>
        <button class="danger-btn" data-delete-hook="${item.id}" type="button">Delete</button>
      </div>
    </div>
  `;
}

function deliveryCard(item) {
  return `
    <div class="list-card">
      <strong>${item.eventType || 'Delivery'}</strong><br>
      <span class="muted">${item.deliveryStatus || '-'}</span><br>
      <span class="muted">${item.targetUrl || '-'}</span>
      <div class="actions">
        <button class="ghost-btn" data-retry-delivery="${item.id}" type="button">Retry</button>
      </div>
    </div>
  `;
}

async function loadWebhooks() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'AUTOMATION',
    title: 'Webhooks',
    subtitle: 'Manage outgoing webhook integrations'
  });

  content.innerHTML = `
    <section class="card">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>Webhook Controls</h2>
        </div>
        <div class="actions">
          <button id="create-hook-btn" class="primary-btn" type="button">+ Create Webhook</button>
          <button id="refresh-webhooks-btn" class="ghost-btn" type="button">Refresh</button>
        </div>
      </div>
    </section>

    <section id="webhook-list" class="card" style="margin-top:18px">
      <div class="muted">Loading webhooks...</div>
    </section>

    <section id="delivery-list" class="card" style="margin-top:18px">
      <div class="muted">Loading deliveries...</div>
    </section>
  `;

  document.getElementById('create-hook-btn').onclick = () => USGCrudKit.create({
    title: 'Create Webhook',
    endpoint: '/api/webhooks',
    fields: [
      { name: 'name', label: 'Webhook Name' },
      { name: 'url', label: 'Target URL' },
      { name: 'event', label: 'Event Name' }
    ],
    onDone: () => loadWebhooks()
  });

  document.getElementById('refresh-webhooks-btn').onclick = () => loadWebhooks();

  const hookWrap = document.getElementById('webhook-list');
  const deliveryWrap = document.getElementById('delivery-list');

  try {
    const [hooks, deliveryData] = await Promise.all([
      safeJson('/api/webhooks'),
      safeJson('/api/webhook-advanced/deliveries')
    ]);

    const hookRows = Array.isArray(hooks) ? hooks : (hooks.webhooks || []);
    const deliveries = deliveryData.deliveries || [];

    hookWrap.innerHTML = `
      <div class="kicker">REGISTERED</div>
      <h2>Webhooks</h2>
      ${hookRows.length ? hookRows.map(hookCard).join('') : USGEnhancedUI.emptyCard('No webhooks found', 'Create one to start automations.')}
    `;

    deliveryWrap.innerHTML = `
      <div class="kicker">DELIVERIES</div>
      <h2>Recent Deliveries</h2>
      ${deliveries.length ? deliveries.map(deliveryCard).join('') : USGEnhancedUI.emptyCard('No deliveries found', 'Test a webhook to generate delivery logs.')}
    `;

    document.querySelectorAll('[data-test-hook]').forEach(btn => {
      btn.onclick = async () => {
        try {
          await safeJson(`/api/webhook-advanced/${btn.dataset.testHook}/test`, { method: 'POST' });
          USGEnhancedUI.success('Webhook Tested', 'Delivery sent successfully');
          loadWebhooks();
        } catch (err) {
          USGEnhancedUI.error('Webhook Test Failed', err.message);
        }
      };
    });

    document.querySelectorAll('[data-delete-hook]').forEach(btn => {
      btn.onclick = async () => {
        if (!USGEnhancedUI.confirmAction('Delete this webhook?')) return;
        try {
          const res = await apiFetch(`/api/webhooks/${btn.dataset.deleteHook}`, { method: 'DELETE' });
          const out = await res.json();
          if (!res.ok) throw new Error(out.message || 'Delete failed');
          USGEnhancedUI.success('Webhook Deleted', out.message || 'Webhook deleted successfully');
          loadWebhooks();
        } catch (err) {
          USGEnhancedUI.error('Delete Failed', err.message);
        }
      };
    });

    document.querySelectorAll('[data-retry-delivery]').forEach(btn => {
      btn.onclick = async () => {
        try {
          await safeJson(`/api/webhook-advanced/deliveries/${btn.dataset.retryDelivery}/retry`, { method: 'POST' });
          USGEnhancedUI.success('Delivery Retried', 'Webhook delivery retried successfully');
          loadWebhooks();
        } catch (err) {
          USGEnhancedUI.error('Retry Failed', err.message);
        }
      };
    });
  } catch (err) {
    hookWrap.innerHTML = `<div class="muted">Webhook Error: ${err.message}</div>`;
    deliveryWrap.innerHTML = `<div class="muted">Delivery Error: ${err.message}</div>`;
  }
}

loadWebhooks();
