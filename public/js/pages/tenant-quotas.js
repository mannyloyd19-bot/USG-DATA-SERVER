requireAuth();
USGShell.buildShell();

async function loadQuotas() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'TENANTS',
    title: 'Tenant Quotas',
    subtitle: 'Monitor limits and usage'
  });

  const res = await apiFetch('/api/tenant-usage/summary');
  const data = await res.json();
  const tenants = data.tenants || [];

  content.innerHTML = tenants.map(t => `
    <div class="list-card">
      <strong>${t.name}</strong><br>
      <span class="muted">Records: ${t.apiCalls} | Storage: ${t.storageUsedMb}MB</span>
      <div class="actions">
        ${USGPageKit.statusBadge(t.status)}
      </div>
    </div>
  `).join('');
}
loadQuotas();
