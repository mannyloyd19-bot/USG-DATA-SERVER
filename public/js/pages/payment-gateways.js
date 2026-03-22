window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPaymentGateways() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'GATEWAYS',
    title: 'Payment Gateways',
    subtitle: 'Gateway health, provider readiness, and webhook endpoints'
  });

  try {
    const res = await apiFetch('/api/payment-gateway/health');
    const data = await res.json();
    const rows = data.gateways || [];

    content.innerHTML += `
      <section class="card">
        <div class="kicker">WEBHOOK ENDPOINTS</div>
        <h2>Receive URLs</h2>
        <div class="muted">
          Stripe: /api/payment-gateway/webhook/stripe<br>
          PayMongo: /api/payment-gateway/webhook/paymongo<br>
          PayPal: /api/payment-gateway/webhook/paypal
        </div>
      </section>
    `;

    const wrap = document.createElement('section');
    wrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.key}</strong><br>
        <div class="actions">
          ${USGPageKit.statusBadge(item.enabled ? 'enabled' : 'disabled')}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No gateways found' });

    content.appendChild(wrap);
  } catch (error) {
    USGIOSAlert.show({ title: 'Gateway Error', message: error.message, type: 'error' });
  }
}
loadPaymentGateways();
