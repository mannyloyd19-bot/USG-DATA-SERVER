window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validatePayment(data) {
  return USGValidationKit.collect(
    USGValidationKit.required(data.tenantId, 'Tenant ID'),
    USGValidationKit.required(data.provider, 'Provider'),
    USGValidationKit.required(data.amount, 'Amount')
  );
}

async function loadPayments() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'PAYMENTS',
    title: 'Payments',
    subtitle: 'Track payment entries, provider status, and settlement state'
  });

  const actionWrap = document.createElement('section');
  actionWrap.className = 'card';
  actionWrap.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Payment Controls</h2>
      </div>
      <div class="actions">
        <button id="create-payment-btn" class="primary-btn" type="button">+ Add Payment</button>
        <button id="refresh-payments-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionWrap);

  document.getElementById('refresh-payments-btn').onclick = () => loadPayments();

  document.getElementById('create-payment-btn').onclick = () => USGCrudKit.create({
    title: 'Add Payment',
    endpoint: '/api/payments',
    validate: validatePayment,
    fields: [
      { name: 'tenantId', label: 'Tenant ID' },
      { name: 'invoiceId', label: 'Invoice ID' },
      { name: 'provider', label: 'Provider (manual/stripe/paymongo/paypal)' },
      { name: 'referenceCode', label: 'Reference Code' },
      { name: 'amount', label: 'Amount' },
      { name: 'currency', label: 'Currency' }
    ],
    onDone: () => loadPayments()
  });

  try {
    const res = await apiFetch('/api/payments');
    const data = await res.json();
    const rows = data.payments || [];

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.provider || 'payment'}</strong><br>
        <span class="muted">Tenant: ${item.tenantId}</span><br>
        <span class="muted">Ref: ${item.referenceCode || '-'}</span><br>
        <span class="muted">Amount: ${item.amount} ${item.currency || 'PHP'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(item.status || 'pending')}
          <button class="ghost-btn" data-mark-paid="${item.id}" type="button">Mark Paid</button>
          <button class="danger-btn" data-mark-failed="${item.id}" type="button">Mark Failed</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No payments found' });

    content.appendChild(listWrap);

    document.querySelectorAll('[data-mark-paid]').forEach(btn => {
      btn.onclick = async () => {
        await apiFetch(`/api/payments/${btn.dataset.markPaid}/mark-paid`, { method: 'POST' });
        loadPayments();
      };
    });

    document.querySelectorAll('[data-mark-failed]').forEach(btn => {
      btn.onclick = async () => {
        await apiFetch(`/api/payments/${btn.dataset.markFailed}/mark-failed`, { method: 'POST' });
        loadPayments();
      };
    });

  } catch (error) {
    USGIOSAlert.show({ title: 'Payments Error', message: error.message, type: 'error' });
  }
}
loadPayments();
