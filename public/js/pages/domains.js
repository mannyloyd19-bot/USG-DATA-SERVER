requireAuth();
USGShell.buildShell();

function asBool(v) {
  return String(v) === 'true';
}

async function loadDomainsPage() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">DOMAIN CENTER</div>
      <h1 style="margin:6px 0 0;font-size:32px">USG Domain Engine</h1>
      <div class="muted">Create internal .usg domains, map them to routes/apps, preview public URLs, and generate Nginx-style routing configs.</div>
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">CREATE DOMAIN</div>
        <h2>New Domain Mapping</h2>
        <form id="domain-form">
          <input id="domain-name" placeholder="service.usg" required>
          <div class="row-top">
            <select id="domain-type">
              <option value="internal">internal</option>
              <option value="public">public</option>
            </select>
            <select id="domain-target-type">
              <option value="route">route</option>
              <option value="module">module</option>
              <option value="app">app</option>
            </select>
          </div>
          <input id="domain-target" placeholder="/service" required>
          <input id="domain-internal-host" placeholder="service.usg">
          <input id="domain-external-host" placeholder="service.usgdataserver.duckdns.org">
          <input id="domain-public-path" placeholder="/">
          <div class="row-top">
            <select id="domain-ssl">
              <option value="false">SSL disabled</option>
              <option value="true">SSL enabled</option>
            </select>
            <select id="domain-proxy">
              <option value="false">Reverse proxy disabled</option>
              <option value="true">Reverse proxy enabled</option>
            </select>
          </div>
          <textarea id="domain-notes" rows="5" placeholder="Notes / routing remarks"></textarea>
          <div class="actions">
            <button class="primary-btn" type="submit">Create Domain</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">PREVIEW</div>
        <h2>Domain Output</h2>
        <pre id="domain-preview-box">No domain created yet.</pre>
      </section>
    </div>

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">DOMAIN REGISTRY</div>
        <h2>All Domain Mappings</h2>
        <div id="domains-list">Loading...</div>
      </section>

      <section class="card">
        <div class="kicker">ROUTING PREVIEW</div>
        <h2>Nginx-style Config</h2>
        <pre id="domain-nginx-box">Select or create a domain first.</pre>
      </section>
    </div>
  `;

  const form = document.getElementById('domain-form');
  const list = document.getElementById('domains-list');
  const preview = document.getElementById('domain-preview-box');
  const nginxBox = document.getElementById('domain-nginx-box');

  async function loadNginxPreview(id) {
    try {
      const res = await apiFetch(`/api/domains/${id}/nginx-preview`);
      const data = await res.json();
      nginxBox.textContent = data.preview || 'No preview available.';
      USGShell.setupRawToggles(content);
    } catch (error) {
      nginxBox.textContent = JSON.stringify({ error: error.message }, null, 2);
      USGShell.setupRawToggles(content);
    }
  }

  async function refresh() {
    try {
      const res = await apiFetch('/api/domains');
      const data = await res.json();
      const rows = Array.isArray(data.domains) ? data.domains : [];

      list.innerHTML = rows.map(item => `
        <div class="list-card">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <div>
              <strong>${item.name}</strong><br>
              <span class="muted">type: ${item.type || 'internal'} · target type: ${item.targetType || 'route'}</span><br>
              <span class="muted">target: ${item.target}</span><br>
              <span class="muted">internal: ${item.internalHost || '-'}</span><br>
              <span class="muted">external: ${item.externalHost || '-'}</span><br>
              <span class="muted">public path: ${item.publicPath || '/'}</span><br>
              <span class="muted">SSL: ${item.sslEnabled ? 'enabled' : 'disabled'} · proxy: ${item.reverseProxyEnabled ? 'enabled' : 'disabled'}</span><br>
              <span class="muted">status: ${item.isActive ? 'active' : 'inactive'}</span>
            </div>
            <div class="badge ${item.isActive ? 'ok' : 'warn'}">
              <span class="badge-dot"></span>${item.isActive ? 'active' : 'inactive'}
            </div>
          </div>

          <div style="margin-top:10px" class="muted">internal preview: ${item.internalPreview || '-'}</div>
          <div class="muted">public preview: ${item.publicPreview || 'not configured'}</div>

          <div class="actions">
            <button class="ghost-btn" type="button" data-nginx="${item.id}">Nginx Preview</button>
            <button class="ghost-btn" type="button" data-toggle="${item.id}" data-active="${item.isActive ? 'true' : 'false'}">${item.isActive ? 'Disable' : 'Enable'}</button>
            <button class="danger-btn" type="button" data-delete="${item.id}">Delete</button>
          </div>
        </div>
      `).join('') || '<div class="muted">No domains found.</div>';

      document.querySelectorAll('[data-nginx]').forEach(btn => {
        btn.addEventListener('click', () => loadNginxPreview(btn.getAttribute('data-nginx')));
      });

      document.querySelectorAll('[data-toggle]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-toggle');
          const current = btn.getAttribute('data-active') === 'true';

          try {
            const res = await apiFetch(`/api/domains/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: !current })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update domain');
            refresh();
          } catch (error) {
            alert(error.message);
          }
        });
      });

      document.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete');
          if (!confirm('Delete this domain?')) return;

          try {
            const res = await apiFetch(`/api/domains/${id}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete domain');
            refresh();
          } catch (error) {
            alert(error.message);
          }
        });
      });

      USGShell.setupRawToggles(content);
    } catch (error) {
      list.innerHTML = `<div class="muted">${error.message}</div>`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('domain-name').value.trim(),
      type: document.getElementById('domain-type').value,
      targetType: document.getElementById('domain-target-type').value,
      target: document.getElementById('domain-target').value.trim(),
      internalHost: document.getElementById('domain-internal-host').value.trim(),
      externalHost: document.getElementById('domain-external-host').value.trim(),
      publicPath: document.getElementById('domain-public-path').value.trim() || '/',
      sslEnabled: asBool(document.getElementById('domain-ssl').value),
      reverseProxyEnabled: asBool(document.getElementById('domain-proxy').value),
      notes: document.getElementById('domain-notes').value.trim()
    };

    try {
      const res = await apiFetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create domain');

      preview.textContent = JSON.stringify({
        name: data.domain?.name,
        target: data.domain?.target,
        internalPreview: data.domain?.internalPreview,
        publicPreview: data.domain?.publicPreview,
        sslEnabled: data.domain?.sslEnabled,
        reverseProxyEnabled: data.domain?.reverseProxyEnabled
      }, null, 2);

      nginxBox.textContent = data.domain?.nginxPreview || 'No preview available.';
      form.reset();
      refresh();
      USGShell.setupRawToggles(content);
    } catch (error) {
      alert(error.message);
    }
  });

  refresh();
}

loadDomainsPage();
