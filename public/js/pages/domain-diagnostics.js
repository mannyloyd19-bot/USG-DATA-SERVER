window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function safeJson(url) {
  try {
    const res = await apiFetch(url);
    return await res.json();
  } catch {
    return {};
  }
}

function badge(value) {
  const v = String(value || '').toLowerCase();
  if (v.includes('ok') || v.includes('active') || v.includes('online')) return USGPageKit.statusBadge('online');
  if (v.includes('warn')) return USGPageKit.statusBadge('warning');
  if (v.includes('fail') || v.includes('error') || v.includes('offline')) return USGPageKit.statusBadge('error');
  return USGPageKit.statusBadge('neutral');
}

function domainCard(d) {
  return `
    <div class="list-card">
      <strong>${d.domain || d.host || 'Domain'}</strong><br>
      <span class="muted">Status: ${d.status || 'unknown'}</span><br>
      <span class="muted">SSL: ${d.sslStatus || 'unknown'}</span><br>
      <span class="muted">Target: ${d.target || '-'}</span><br>
      <div class="actions" style="margin-top:8px">
        ${badge(d.status)}
        ${badge(d.sslStatus)}
        <a href="/pages/domains.html" class="ghost-btn">Manage</a>
      </div>
    </div>
  `;
}

async function loadDomainDiagnostics() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'NETWORK',
    title: 'Domain Diagnostics',
    subtitle: 'Monitor domain binding, SSL status, and public accessibility'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Domain Controls</h2>
      </div>
      <div class="actions">
        <button id="domain-refresh-btn" class="ghost-btn">Refresh</button>
        <a href="/pages/domains.html" class="primary-btn">Domains</a>
        <a href="/pages/system-health.html" class="ghost-btn">System Health</a>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('domain-refresh-btn').onclick = loadDomainDiagnostics;

  const loading = document.createElement('section');
  loading.className = 'card';
  loading.style.marginTop = '18px';
  loading.innerHTML = `<div class="muted">Loading domain diagnostics...</div>`;
  content.appendChild(loading);

  try {
    const [domains, health] = await Promise.all([
      safeJson('/api/domains'),
      safeJson('/api/domain-diagnostics')
    ]);

    loading.remove();

    const rows = Array.isArray(domains)
      ? domains
      : (domains.domains || domains.data || []);

    const diag = Array.isArray(health)
      ? health
      : (health.results || health.data || []);

    const merged = rows.map(d => {
      const match = diag.find(x => x.domain === d.domain) || {};
      return {
        domain: d.domain,
        status: match.status || d.status,
        sslStatus: match.sslStatus || 'unknown',
        target: d.target || d.route || '-'
      };
    });

    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.style.marginTop = '18px';

    wrap.innerHTML = `
      <div class="kicker">DOMAINS</div>
      <h2>Domain Status</h2>
      ${
        merged.length
          ? merged.map(domainCard).join('')
          : USGPageKit.emptyState({ title: 'No domains configured' })
      }
    `;

    content.appendChild(wrap);

    content.innerHTML += `
      <section class="card" style="margin-top:18px">
        <div class="kicker">CHECKS</div>
        <h2>Diagnostics Summary</h2>
        <div class="list-card">
          <strong>Total Domains</strong><br>
          <span class="muted">${merged.length}</span>
        </div>
        <div class="list-card">
          <strong>Healthy</strong><br>
          <span class="muted">${merged.filter(d => String(d.status).toLowerCase().includes('ok')).length}</span>
        </div>
        <div class="list-card">
          <strong>SSL Issues</strong><br>
          <span class="muted">${merged.filter(d => String(d.sslStatus).toLowerCase().includes('fail')).length}</span>
        </div>
      </section>
    `;

  } catch (error) {
    loading.remove();

    const err = document.createElement('section');
    err.className = 'card';
    err.style.marginTop = '18px';
    err.innerHTML = `
      <div class="kicker">ERROR</div>
      <h2>Domain Diagnostics Failed</h2>
      <div class="muted">${error.message}</div>
    `;
    content.appendChild(err);
  }
}

loadDomainDiagnostics();
