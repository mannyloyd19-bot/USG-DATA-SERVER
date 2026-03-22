window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function safeJson(url, options) {
  try {
    const res = await apiFetch(url, options);
    return await res.json();
  } catch {
    return {};
  }
}

function metricCard(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title.toUpperCase()}</div>
      <h2>${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

async function loadBilling() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'BILLING',
    title: 'Billing & Usage',
    subtitle: 'Plans, subscriptions, quotas, and tenant usage'
  });

  const actionWrap = document.createElement('section');
  actionWrap.className = 'card';
  actionWrap.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Billing Controls</h2>
      </div>
      <div class="actions">
        <button id="seed-plans-btn" class="ghost-btn" type="button">Seed Plans</button>
        <button id="refresh-billing-btn" class="primary-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionWrap);

  document.getElementById('seed-plans-btn').onclick = async () => {
    await apiFetch('/api/billing/seed-plans', { method: 'POST' });
    loadBilling();
  };
  document.getElementById('refresh-billing-btn').onclick = () => loadBilling();

  const tenantId = localStorage.getItem('usg_tenant_id') || '';

  const [plansData, subsData, summaryData] = await Promise.all([
    safeJson('/api/billing/plans'),
    safeJson('/api/billing/subscriptions'),
    safeJson(`/api/billing/tenant-summary?tenantId=${encodeURIComponent(tenantId)}`)
  ]);

  const plans = plansData.plans || [];
  const subscriptions = subsData.subscriptions || [];
  const usage = summaryData.usage || {};
  const quotas = summaryData.quotas || {};
  const subscription = summaryData.subscription || {};
  const plan = summaryData.plan || {};

  content.innerHTML += `
    <div class="grid-4">
      ${metricCard('Plan', plan.name || 'No Plan', 'Current tenant plan')}
      ${metricCard('Requests', `${usage.requestsUsed || 0} / ${quotas.requestQuota || 0}`, 'Monthly request usage')}
      ${metricCard('Storage', `${usage.storageUsedMb || 0} MB / ${quotas.storageQuotaMb || 0} MB`, 'Monthly storage usage')}
      ${metricCard('Files', `${usage.filesUsed || 0} / ${quotas.fileQuota || 0}`, 'Monthly file usage')}
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">PLANS</div>
        <h2>Available Plans</h2>
        ${
          plans.length
            ? plans.map(p => `
              <div class="list-card">
                <strong>${p.name}</strong><br>
                <span class="muted">Key: ${p.key}</span><br>
                <span class="muted">Price: ${p.monthlyPrice}/mo</span><br>
                <span class="muted">Requests: ${p.requestQuota} · Storage: ${p.storageQuotaMb}MB · Files: ${p.fileQuota}</span>
              </div>
            `).join('')
            : '<div class="muted">No plans yet.</div>'
        }
      </section>

      <section class="card">
        <div class="kicker">SUBSCRIPTIONS</div>
        <h2>Tenant Subscriptions</h2>
        ${
          subscriptions.length
            ? subscriptions.map(s => `
              <div class="list-card">
                <strong>${s.tenantId}</strong><br>
                <span class="muted">Plan: ${s.planKey}</span><br>
                <span class="muted">Status: ${s.status}</span>
              </div>
            `).join('')
            : '<div class="muted">No subscriptions yet.</div>'
        }
      </section>
    </div>

    <section class="card">
      <div class="kicker">CURRENT TENANT</div>
      <h2>Subscription Summary</h2>
      <div class="muted">
        Tenant: ${subscription.tenantId || tenantId || 'not set'}<br>
        Plan: ${subscription.planKey || '-'}<br>
        Status: ${subscription.status || '-'}<br>
        Period: ${subscription.currentPeriodStart || '-'} to ${subscription.currentPeriodEnd || '-'}
      </div>
    </section>
  `;
}
loadBilling();
