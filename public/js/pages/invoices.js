window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validateInvoice(data) {
  return USGValidationKit.collect(
    USGValidationKit.required(data.tenantId, 'Tenant ID'),
    USGValidationKit.required(data.amount, 'Amount')
  );
}

async function loadInvoices() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'INVOICES',
    title: 'Invoices',
    subtitle: 'Manage invoice registry, due dates, and payment status'
  });

  const actionWrap = document.createElement('section');
  actionWrap.className = 'card';
  actionWrap.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Invoice Controls</h2>
      </div>
      <div class="actions">
        <button id="create-invoice-btn" class="primary-btn" type="button">+ Create Invoice</button>
        <button id="refresh-invoices-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionWrap);

  document.getElementById('refresh-invoices-btn').onclick = () => loadInvoices();

  document.getElementById('create-invoice-btn').onclick = () => USGCrudKit.create({
    title: 'Create Invoice',
    endpoint: '/api/invoices',
    validate: validateInvoice,
    fields: [
      { name: 'tenantId', label: 'Tenant ID' },
      { name: 'planKey', label: 'Plan Key' },
      { name: 'amount', label: 'Amount' },
      { name: 'currency', label: 'Currency' },
      { name: 'dueDate', label: 'Due Date (ISO)' },
      { name: 'notes', label: 'Notes' }
    ],
    onDone: () => loadInvoices()
  });

  try {
    const res = await apiFetch('/api/invoices');
    const data = await res.json();
    const rows = data.invoices || [];

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.invoiceNumber || 'invoice'}</strong><br>
        <span class="muted">Tenant: ${item.tenantId}</span><br>
        <span class="muted">Plan: ${item.planKey || '-'}</span><br>
        <span class="muted">Amount: ${item.amount} ${item.currency || 'PHP'}</span><br>
        <span class="muted">Due: ${item.dueDate || '-'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(item.status || 'draft')}
          <button class="ghost-btn" data-mark-paid="${item.id}" type="button">Mark Paid</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No invoices found' });

    content.appendChild(listWrap);

    document.querySelectorAll('[data-mark-paid]').forEach(btn => {
      btn.onclick = async () => {
        await apiFetch(`/api/invoices/${btn.dataset.markPaid}/mark-paid`, { method: 'POST' });
        loadInvoices();
      };
    });

  } catch (error) {
    USGIOSAlert.show({ title: 'Invoices Error', message: error.message, type: 'error' });
  }
}
loadInvoices();
