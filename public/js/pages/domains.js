window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validateDomain(data) {
  return USGValidationKit.collect(
    USGValidationKit.required(data.name, 'Domain'),
    USGValidationKit.domain(data.name, 'Domain'),
    USGValidationKit.required(data.serviceName, 'Service Name'),
    USGValidationKit.required(data.routePath, 'Route Path'),
    USGValidationKit.route(data.routePath, 'Route Path')
  );
}

function configBlock(binding) {
  const cfg = binding?.config || {};
  return `APP_NAME=${cfg.APP_NAME || ''}
APP_DOMAIN=${cfg.APP_DOMAIN || ''}
APP_ROUTE=${cfg.APP_ROUTE || '/'}
USG_DOMAIN_KEY=${cfg.USG_DOMAIN_KEY || ''}
USG_API_BASE_URL=${cfg.USG_API_BASE_URL || ''}
USG_APP_TOKEN=${cfg.USG_APP_TOKEN || ''}`;
}

function openCreateDomainModal(onDone) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.padding = '20px';

  const box = document.createElement('div');
  box.style.width = 'min(460px, 95vw)';
  box.style.background = '#0f172a';
  box.style.borderRadius = '22px';
  box.style.padding = '22px';
  box.style.color = '#fff';
  box.style.border = '1px solid rgba(255,255,255,.10)';

  box.innerHTML = `
    <h2 style="margin-top:0">Create Domain</h2>

    <input id="d-name" placeholder="Domain (.usg)" style="width:100%;margin:8px 0;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#111827;color:#fff">
    <input id="d-service" placeholder="Service Name" style="width:100%;margin:8px 0;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#111827;color:#fff">
    <input id="d-route" placeholder="/website" style="width:100%;margin:8px 0;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#111827;color:#fff">

    <select id="d-access" style="width:100%;margin:8px 0;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#111827;color:#fff">
      <option value="public">Public</option>
      <option value="internal">Internal</option>
    </select>

    <select id="d-env" style="width:100%;margin:8px 0;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#111827;color:#fff">
      <option value="production">Production</option>
      <option value="staging">Staging</option>
      <option value="development">Development</option>
    </select>

    <textarea id="d-notes" placeholder="Notes" style="width:100%;margin:8px 0;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#111827;color:#fff;min-height:90px"></textarea>

    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px">
      <button id="cancel-domain-modal" class="ghost-btn" type="button">Cancel</button>
      <button id="create-domain-submit" class="primary-btn" type="button">Create</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById('cancel-domain-modal').onclick = () => overlay.remove();

  document.getElementById('create-domain-submit').onclick = async () => {
    const payload = {
      name: document.getElementById('d-name').value.trim(),
      serviceName: document.getElementById('d-service').value.trim(),
      routePath: document.getElementById('d-route').value.trim(),
      accessMode: document.getElementById('d-access').value,
      environment: document.getElementById('d-env').value,
      notes: document.getElementById('d-notes').value.trim()
    };

    const errors = validateDomain(payload);
    if (errors.length) {
      USGIOSAlert.show({
        title: 'Validation Error',
        message: errors.join('\n'),
        type: 'error'
      });
      return;
    }

    try {
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

      overlay.remove();
      USGIOSAlert.show({
        title: 'Domain Created',
        message: result.domain?.name || 'Domain created successfully'
      });

      if (typeof onDone === 'function') onDone();
    } catch (error) {
      USGIOSAlert.show({
        title: 'Create Domain Failed',
        message: error.message,
        type: 'error'
      });
    }
  };
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
        <div class="list-card"><strong>Domain Key</strong><br><span class="muted">${binding.domainKey || '-'}</span></div>
        <div class="list-card"><strong>App Token</strong><br><span class="muted">${binding.appToken || '-'}</span></div>
      </section>

      <section class="card" style="margin-top:18px">
        <div class="kicker">PROJECT CONFIG</div>
        <h2>Copy to Project</h2>
        <pre>${block}</pre>
        <div class="actions">
          <button class="ghost-btn" id="copy-binding-config" type="button">Copy Config</button>
          <button class="ghost-btn" id="copy-domain-key" type="button">Copy Domain Key</button>
          <button class="ghost-btn" id="copy-app-token" type="button">Copy App Token</button>
          ${binding.publicAddress ? `<a href="${binding.publicAddress}" target="_blank" class="primary-btn">Open Public URL</a>` : ''}
        </div>
      </section>

      <div class="actions" style="margin-top:18px;justify-content:flex-end">
        <button class="ghost-btn" id="close-binding-modal" type="button">Close</button>
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

async function renderDomainList(content, rows) {
  const listHost = document.createElement('section');
  listHost.style.marginTop = '18px';

  listHost.innerHTML = rows.length ? rows.map(d => `
    <div class="list-card">
      <strong>${d.name}</strong><br>
      <span class="muted">Service: ${d.serviceName || '-'}</span><br>
      <span class="muted">Route: ${d.routePath || '-'}</span><br>
      <span class="muted">Public Address: ${d.publicAddress || 'Internal Only'}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(d.status || 'active')}
        ${d.publicAddress ? USGPageKit.copyButton(d.publicAddress, 'Copy URL') : ''}
        <button class="ghost-btn" data-binding="${d.id}" type="button">Binding</button>
        ${d.publicAddress && d.publicAddress !== 'Internal Only' ? `<a href="${d.publicAddress}" target="_blank" class="ghost-btn">Open</a>` : ''}
        <button class="danger-btn" data-delete="${d.id}" type="button">Delete</button>
      </div>
    </div>
  `).join('') : USGPageKit.emptyState({
    title: 'No domains yet',
    message: 'Create your first public or internal domain.'
  });

  content.appendChild(listHost);

  USGPageKit.wireCopyButtons(content);
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
        onClick: () => openCreateDomainModal(() => loadDomains())
      }
    ]
  });

  const toolbarWrap = document.createElement('div');
  toolbarWrap.innerHTML = USGPageKit.searchToolbar({
    placeholder: 'Search domains...'
  });
  content.appendChild(toolbarWrap);

  const loadingWrap = document.createElement('div');
  loadingWrap.innerHTML = USGPageKit.loadingState({ label: 'Loading domains...' });
  content.appendChild(loadingWrap);

  try {
    const res = await apiFetch('/api/domains');
    const data = await res.json();
    const rows = data.domains || [];

    loadingWrap.remove();
    await renderDomainList(content, rows);
  } catch (err) {
    loadingWrap.remove();
    const errWrap = document.createElement('div');
    errWrap.innerHTML = USGPageKit.emptyState({
      title: 'Domain page failed to load',
      message: err.message || 'Unknown error'
    });
    content.appendChild(errWrap);

    USGIOSAlert.show({
      title: 'Domain Error',
      message: err.message,
      type: 'error'
    });
  }
}

loadDomains();
