requireAuth();
USGShell.buildShell();

function configBlock(binding) {
  const cfg = binding?.config || {};
  return `APP_NAME=${cfg.APP_NAME || ''}
APP_DOMAIN=${cfg.APP_DOMAIN || ''}
APP_ROUTE=${cfg.APP_ROUTE || '/'}
USG_DOMAIN_KEY=${cfg.USG_DOMAIN_KEY || ''}
USG_API_BASE_URL=${cfg.USG_API_BASE_URL || ''}
USG_APP_TOKEN=${cfg.USG_APP_TOKEN || ''}`;
}

async function openBindingModal(domainId) {
  try {
    await apiFetch(`/api/domain-bindings/${domainId}/ensure`, { method: 'POST' });
    const res = await apiFetch(`/api/domain-bindings/${domainId}`);
    const data = await res.json();
    const binding = data.binding || {};

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.55)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';
    overlay.style.padding = '20px';

    const box = document.createElement('div');
    box.style.width = 'min(780px, 95vw)';
    box.style.maxHeight = '90vh';
    box.style.overflow = 'auto';
    box.style.background = 'rgba(12,18,36,0.98)';
    box.style.border = '1px solid rgba(255,255,255,.10)';
    box.style.borderRadius = '24px';
    box.style.padding = '22px';
    box.style.color = '#fff';

    const block = configBlock(binding)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');

    box.innerHTML = `
      <div class="kicker">DOMAIN APP BINDING</div>
      <h2 style="margin-top:8px">${binding.domain || 'Domain'}</h2>
      <div class="grid-3" style="margin-top:18px">
        <div class="info-card"><div class="info-title">Service</div><div class="info-value" style="font-size:18px">${binding.serviceName || '-'}</div></div>
        <div class="info-card"><div class="info-title">Bind Status</div><div class="info-value" style="font-size:18px">${binding.bindStatus || 'unbound'}</div></div>
        <div class="info-card"><div class="info-title">Route</div><div class="info-value" style="font-size:18px">${binding.routePath || '/'}</div></div>
      </div>

      <section class="card" style="margin-top:18px">
        <div class="kicker">IDENTITY</div>
        <h2>Binding Keys</h2>
        <div class="list-card">
          <strong>Domain Key</strong><br>
          <span class="muted">${binding.domainKey || '-'}</span>
        </div>
        <div class="list-card">
          <strong>App Token</strong><br>
          <span class="muted">${binding.appToken || '-'}</span>
        </div>
      </section>

      <section class="card" style="margin-top:18px">
        <div class="kicker">PROJECT CONFIG</div>
        <h2>Copy to Project</h2>
        <pre id="binding-config-block">${block}</pre>
        <div class="actions">
          <button class="ghost-btn" id="copy-binding-config">Copy Config</button>
          <button class="ghost-btn" id="copy-domain-key">Copy Domain Key</button>
          <button class="ghost-btn" id="copy-app-token">Copy App Token</button>
          ${binding.publicAddress ? `<a href="${binding.publicAddress}" target="_blank" class="primary-btn">Open Public URL</a>` : ''}
        </div>
      </section>

      <div class="actions" style="margin-top:18px;justify-content:flex-end">
        <button class="ghost-btn" id="close-binding-modal">Close</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    document.getElementById('close-binding-modal').onclick = () => overlay.remove();

    async function copyValue(value, title) {
      try {
        await navigator.clipboard.writeText(value || '');
        USGIOSAlert.show({ title: 'Copied', message: title });
      } catch {
        USGIOSAlert.show({ title: 'Copy Failed', message: title, type: 'error' });
      }
    }

    document.getElementById('copy-binding-config').onclick = () => copyValue(configBlock(binding), 'Project config copied');
    document.getElementById('copy-domain-key').onclick = () => copyValue(binding.domainKey || '', 'Domain key copied');
    document.getElementById('copy-app-token').onclick = () => copyValue(binding.appToken || '', 'App token copied');

  } catch (error) {
    USGIOSAlert.show({
      title: 'Binding Error',
      message: error.message,
      type: 'error'
    });
  }
}

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
          <button class="ghost-btn" data-binding="${d.id}">Binding</button>
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

    document.querySelectorAll('[data-binding]').forEach(btn => {
      btn.onclick = () => openBindingModal(btn.dataset.binding);
    });

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
