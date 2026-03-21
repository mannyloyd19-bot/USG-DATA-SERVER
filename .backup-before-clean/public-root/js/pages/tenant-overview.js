requireAuth();
USGShell.buildShell();

async function loadTenantOverview() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'TENANTS',
    title: 'Tenant Overview',
    subtitle: 'Real tenant usage and status summary'
  });

  try {
    const res = await apiFetch('/api/tenant-usage/summary');
    const data = await res.json();
    const rows = data.tenants || [];

    content.innerHTML += `
      <div class="grid-3" style="margin-top:18px">
        ${USGPageKit.infoCard('Tenants', rows.length)}
        ${USGPageKit.infoCard('Active', rows.filter(x => x.status === 'active').length)}
        ${USGPageKit.infoCard('Suspended', rows.filter(x => x.status === 'suspended').length)}
      </div>

      <section class="card" style="margin-top:24px">
        <div class="kicker">USAGE</div>
        <h2>Tenant Usage</h2>
        ${rows.length ? rows.map(t => `
          <div class="list-card">
            <strong>${t.name}</strong><br>
            <span class="muted">storage: ${t.storageUsedMb} MB · api calls: ${t.apiCalls} · members: ${t.members}</span>
            <div class="actions">${USGPageKit.statusBadge(t.status)}</div>
          </div>
        `).join('') : USGPageKit.emptyState({ title: 'No tenants found' })}
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Tenant Error', message: err.message, type: 'error' });
  }
}
loadTenantOverview();
