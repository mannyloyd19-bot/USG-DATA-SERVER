requireAuth();
USGShell.buildShell();

async function loadDomainHealth() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DOMAIN HEALTH',
    title: 'Domain Health',
    subtitle: 'Check SSL, routing, and availability'
  });

  try {
    const res = await apiFetch('/api/domains');
    const data = await res.json();
    const rows = data.domains || [];

    const wrap = document.createElement('section');
    wrap.style.marginTop = '18px';

    wrap.innerHTML = rows.map(d => `
      <div class="list-card">
        <strong>${d.name}</strong><br>
        <span class="muted">Route: ${d.routePath}</span><br>
        <span class="muted">SSL: ${d.sslStatus}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(d.status)}
        </div>
      </div>
    `).join('');

    content.appendChild(wrap);

  } catch (e) {
    USGIOSAlert.show({ title: 'Domain Health Error', message: e.message, type: 'error' });
  }
}
loadDomainHealth();
