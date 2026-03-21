requireAuth();
USGShell.buildShell();

async function loadDomains() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DOMAIN',
    title: 'Domain Registry',
    subtitle: 'Create and manage domain bindings for live app access',
    actions: [
      {
        label: '+ Create Domain',
        primary: true,
        onClick: () => {
          USGFormModal({
            title: 'Create Domain',
            fields: [
              { name: 'name', label: 'Domain (.usg)' },
              { name: 'serviceName', label: 'Service Name' },
              { name: 'routePath', label: 'Route Path (/website)' }
            ],
            onSubmit: async (data) => {
              try {
                const payload = {
                  name: (data.name || '').trim(),
                  serviceName: (data.serviceName || '').trim(),
                  routePath: (data.routePath || '').trim(),
                  accessMode: 'public',
                  environment: 'production',
                  notes: ''
                };

                const res = await apiFetch('/api/domains', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });

                const result = await res.json();
                if (!res.ok) {
                  USGIOSAlert.show({
                    title: 'Create Domain Failed',
                    message: result.message || 'Failed to create domain',
                    type: 'error'
                  });
                  return;
                }

                USGIOSAlert.show({
                  title: 'Domain Created',
                  message: `${result.domain?.name || 'Domain'} is now active.`
                });

                loadDomains();
              } catch (error) {
                USGIOSAlert.show({
                  title: 'Create Domain Failed',
                  message: error.message,
                  type: 'error'
                });
              }
            }
          });
        }
      }
    ]
  });

  content.innerHTML += USGPageKit.searchToolbar({
    placeholder: 'Search domains...'
  });

  try {
    const res = await apiFetch('/api/domains');
    const data = await res.json();
    const rows = data.domains || [];

    content.innerHTML += rows.length ? rows.map(d => `
      <div class="list-card">
        <strong>${d.name}</strong><br>
        <span class="muted">Service: ${d.serviceName || '-'}</span><br>
        <span class="muted">Route: ${d.routePath || '-'}</span><br>
        <span class="muted">Public Address: ${d.publicAddress || 'Internal Only'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(d.status || 'active')}
          ${d.publicAddress ? USGPageKit.copyButton(d.publicAddress, 'Copy URL') : ''}
          ${d.publicAddress && d.publicAddress !== 'Internal Only' ? `<a href="${d.publicAddress}" target="_blank" class="ghost-btn">Open</a>` : ''}
          <button class="danger-btn" data-delete="${d.id}">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({
      title: 'No domains yet',
      message: 'Create your first public or internal domain.'
    });

    USGPageKit.wireCopyButtons();
    USGPageKit.attachBasicSearch({});

    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.onclick = async () => {
        const ok = await USGConfirm('Delete this domain?');
        if (!ok) return;

        const res = await apiFetch(`/api/domains/${btn.dataset.delete}`, { method: 'DELETE' });
        const result = await res.json();

        if (!res.ok) {
          USGIOSAlert.show({
            title: 'Delete Failed',
            message: result.message || 'Failed to delete domain',
            type: 'error'
          });
          return;
        }

        USGIOSAlert.show({ title: 'Deleted', message: 'Domain removed successfully.' });
        loadDomains();
      };
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'Domain Error', message: err.message, type: 'error' });
  }
}

loadDomains();
