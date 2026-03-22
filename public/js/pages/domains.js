window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

if (typeof apiFetch !== 'function') {
  window.apiFetch = (url, options = {}) => fetch(url, options);
}

function validateDomain(data) {
  const errors = [];
  if (!data.name || !String(data.name).trim()) errors.push('Domain is required');
  if (!String(data.name || '').toLowerCase().endsWith('.usg')) errors.push('Domain must end with .usg');
  if (!data.serviceName || !String(data.serviceName).trim()) errors.push('Service Name is required');
  if (!data.routePath || !String(data.routePath).trim()) errors.push('Route Path is required');
  if (!String(data.routePath || '').startsWith('/')) errors.push('Route Path must start with /');
  return errors;
}

function normalizeDomainInput(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeRouteInput(value = '') {
  let v = String(value || '').trim().toLowerCase();
  if (!v.startsWith('/')) v = '/' + v;
  return v;
}

function showDebug(message) {
  let box = document.getElementById('domain-debug-box');
  if (!box) {
    box = document.createElement('section');
    box.id = 'domain-debug-box';
    box.className = 'card';
    box.style.marginTop = '18px';
    document.getElementById('page-content').appendChild(box);
  }
  box.innerHTML = `
    <div class="kicker">DOMAIN DEBUG</div>
    <h2>Last Create Attempt</h2>
    <pre style="white-space:pre-wrap">${message}</pre>
  `;
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
      name: normalizeDomainInput(document.getElementById('d-name').value),
      serviceName: document.getElementById('d-service').value.trim(),
      routePath: normalizeRouteInput(document.getElementById('d-route').value),
      accessMode: document.getElementById('d-access').value,
      environment: document.getElementById('d-env').value,
      notes: document.getElementById('d-notes').value.trim()
    };

    const errors = validateDomain(payload);
    if (errors.length) {
      const msg = errors.join('\n');
      showDebug('VALIDATION ERROR\n\n' + msg);
      USGIOSAlert.show({ title: 'Validation Error', message: msg, type: 'error' });
      return;
    }

    try {
      showDebug('SENDING REQUEST...\n\n' + JSON.stringify(payload, null, 2));

      const res = await apiFetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let raw = '';
      let result = {};
      try {
        raw = await res.text();
        result = raw ? JSON.parse(raw) : {};
      } catch {
        result = { message: raw || 'Non-JSON response' };
      }

      const debugText = [
        `HTTP STATUS: ${res.status}`,
        '',
        'PAYLOAD:',
        JSON.stringify(payload, null, 2),
        '',
        'SERVER RESPONSE:',
        typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      ].join('\n');

      showDebug(debugText);

      if (!res.ok) {
        USGIOSAlert.show({
          title: 'Create Domain Failed',
          message: result.message || `HTTP ${res.status}`,
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
      const debugText = [
        'FETCH ERROR',
        '',
        error.message || String(error)
      ].join('\n');
      showDebug(debugText);
      USGIOSAlert.show({
        title: 'Create Domain Failed',
        message: error.message,
        type: 'error'
      });
    }
  };
}

async function loadDomains() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DOMAIN',
    title: 'Domain Registry',
    subtitle: 'Create and manage domain bindings for live app access'
  });

  const topBar = document.createElement('section');
  topBar.className = 'card';
  topBar.style.marginTop = '18px';
  topBar.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Domain Controls</h2>
      </div>
      <div class="actions">
        <button id="domain-create-inline-btn" class="primary-btn" type="button">+ Create Domain</button>
      </div>
    </div>
  `;
  content.appendChild(topBar);

  document.getElementById('domain-create-inline-btn').onclick = () => {
    openCreateDomainModal(() => loadDomains());
  };

  const toolbarWrap = document.createElement('div');
  toolbarWrap.innerHTML = USGPageKit.searchToolbar({
    placeholder: 'Search domains...'
  });
  content.appendChild(toolbarWrap);

  try {
    const res = await apiFetch('/api/domains');
    const data = await res.json();
    const rows = data.domains || [];

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(d => `
      <div class="list-card">
        <strong>${d.name}</strong><br>
        <span class="muted">Service: ${d.serviceName || '-'}</span><br>
        <span class="muted">Route: ${d.routePath || '-'}</span><br>
        <span class="muted">Public Address: ${d.publicAddress || 'Internal Only'}</span>
      </div>
    `).join('') : USGPageKit.emptyState({
      title: 'No domains yet',
      message: 'Create your first public or internal domain.'
    });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});
  } catch (err) {
    const errWrap = document.createElement('div');
    errWrap.innerHTML = USGPageKit.emptyState({
      title: 'Domain page failed to load',
      message: err.message || 'Unknown error'
    });
    content.appendChild(errWrap);
  }
}

loadDomains();
