requireAuth();
USGShell.buildShell();

async function loadDomains() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'DOMAIN',
    title: 'Domain Registry',
    subtitle: 'Manage domains'
  });

  content.innerHTML += `
    <button id="createDomainBtn" class="primary-btn">+ Create Domain</button>
  `;

  document.getElementById('createDomainBtn').onclick = () => {
    USGFormModal({
      title: 'Create Domain',
      fields: [
        { name: 'name', label: 'Domain (.usg)' },
        { name: 'serviceName', label: 'Service' },
        { name: 'routePath', label: 'Route (/path)' }
      ],
      onSubmit: async (data) => {
        await apiFetch('/api/domains', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        loadDomains();
      }
    });
  };

  const res = await apiFetch('/api/domains');
  const data = await res.json();

  content.innerHTML += (data.domains || []).map(d => `
    <div class="list-card">
      <strong>${d.name}</strong><br>
      <span>${d.publicAddress}</span>
      <div class="actions">
        <button data-delete="${d.id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.onclick = async () => {
      const ok = await USGConfirm('Delete this domain?');
      if (!ok) return;
      await apiFetch(`/api/domains/${btn.dataset.delete}`, { method: 'DELETE' });
      loadDomains();
    };
  });
}

loadDomains();
