window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function metricCard(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title.toUpperCase()}</div>
      <h2>${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

function boolText(v) {
  return v ? 'Yes' : 'No';
}

function domainCard(item) {
  const checks = item.checks || {};
  return `
    <div class="list-card">
      <strong>${item.name || 'Domain'}</strong><br>
      <span class="muted">Service: ${item.serviceName || '-'}</span><br>
      <span class="muted">Route: ${item.routePath || '-'}</span><br>
      <span class="muted">Access: ${item.accessMode || '-'}</span><br>
      <span class="muted">SSL: ${item.sslStatus || '-'}</span><br>
      <span class="muted">Public Address: ${item.publicAddress || '-'}</span><br>
      <span class="muted">Healthy Bind: ${boolText(checks.bindHealthy)}</span><br>
      <span class="muted">Has Route: ${boolText(checks.hasRoute)} · Has Service: ${boolText(checks.hasService)}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(item.status || 'unknown')}
        <button class="ghost-btn" data-ssl-active="${item.id}" type="button">SSL Active</button>
        <button class="ghost-btn" data-ssl-pending="${item.id}" type="button">SSL Pending</button>
        <button class="danger-btn" data-inactive-domain="${item.id}" type="button">Mark Inactive</button>
      </div>
    </div>
  `;
}

async function loadDomainDiagnostics() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DOMAIN HEALTH',
    title: 'Domain Diagnostics',
    subtitle: 'Inspect SSL readiness, bind status, and deep domain health details'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Domain Diagnostics Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-domain-diagnostics-btn" class="primary-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-domain-diagnostics-btn').onclick = () => loadDomainDiagnostics();

  try {
    const res = await apiFetch('/api/domain-diagnostics/summary');
    const data = await res.json();
    const summary = data.summary || {};
    const domains = data.domains || [];

    content.innerHTML += `
      <div class="grid-6">
        ${metricCard('Total', summary.total || 0, 'All domains')}
        ${metricCard('Active', summary.active || 0, 'Active domains')}
        ${metricCard('Public', summary.public || 0, 'Public domains')}
        ${metricCard('Internal', summary.internal || 0, 'Internal domains')}
        ${metricCard('SSL Active', summary.sslActive || 0, 'Active certificates')}
        ${metricCard('SSL Pending', summary.sslPending || 0, 'Pending certificates')}
      </div>
    `;

    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';
    wrap.innerHTML = `
      <div class="kicker">DOMAINS</div>
      <h2>Domain Health Matrix</h2>
      ${domains.length ? domains.map(domainCard).join('') : '<div class="muted">No domains found.</div>'}
    `;
    content.appendChild(wrap);

    domains.forEach(item => {
      const activeBtn = document.querySelector(`[data-ssl-active="${item.id}"]`);
      if (activeBtn) {
        activeBtn.onclick = async () => {
          await apiFetch(`/api/domain-diagnostics/${item.id}/ssl-active`, { method: 'POST' });
          loadDomainDiagnostics();
        };
      }

      const pendingBtn = document.querySelector(`[data-ssl-pending="${item.id}"]`);
      if (pendingBtn) {
        pendingBtn.onclick = async () => {
          await apiFetch(`/api/domain-diagnostics/${item.id}/ssl-pending`, { method: 'POST' });
          loadDomainDiagnostics();
        };
      }

      const inactiveBtn = document.querySelector(`[data-inactive-domain="${item.id}"]`);
      if (inactiveBtn) {
        inactiveBtn.onclick = async () => {
          await apiFetch(`/api/domain-diagnostics/${item.id}/inactive`, { method: 'POST' });
          loadDomainDiagnostics();
        };
      }
    });
  } catch (error) {
    USGIOSAlert.show({ title: 'Domain Diagnostics Error', message: error.message, type: 'error' });
  }
}

loadDomainDiagnostics();
