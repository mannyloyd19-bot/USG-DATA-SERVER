requireAuth();
USGShell.buildShell();

function badgeClass(status) {
  if (status === 'active') return 'ok';
  if (status === 'disabled') return 'warn';
  return '';
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

async function loadApiKeys() {
  const content = document.getElementById('page-content');
  const tenant = getCurrentTenant();

  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">ACCESS TOKENS</div>
        <h2>API Keys Advanced</h2>
        <div class="muted">${tenant?.slug ? 'Tenant-scoped: ' + tenant.slug : 'Global scope (no tenant selected)'}</div>

        <form id="api-key-form" style="margin-top:14px">
          <input id="api-key-name" placeholder="API key name" required>
          <input id="api-key-owner" placeholder="Owner / team / app">
          <input id="api-key-purpose" placeholder="Purpose">

          <div class="row-top">
            <select id="api-key-role">
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <input id="api-key-expires" type="datetime-local" placeholder="Expires At">
          </div>

          <div class="row-top">
            <select id="api-key-type">
              <option value="sk">Secret Key (sk)</option>
              <option value="pk">Public Key (pk)</option>
            </select>
            <select id="api-key-environment">
              <option value="live">live</option>
              <option value="test">test</option>
            </select>
          </div>

          <input id="api-key-scopes" placeholder="Scopes, comma-separated">
          <input id="api-key-ip-whitelist" placeholder="IP whitelist, comma-separated">

          <div class="actions">
            <button class="primary-btn" type="submit">Create API Key</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">CREATED KEY</div>
        <h2>Last Generated</h2>
        <pre id="api-key-created-box">No key created yet.</pre>
      </section>
    </div>

    <section class="card">
      <div class="kicker">KEY REGISTRY</div>
      <h2>Managed Keys</h2>
      <div id="api-key-list">Loading...</div>
    </section>
  `;

  const form = document.getElementById('api-key-form');
  const list = document.getElementById('api-key-list');
  const createdBox = document.getElementById('api-key-created-box');

  async function refresh() {
    try {
      const res = await apiFetch('/api/api-keys');
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];

      list.innerHTML = rows.map(item => `
        <div class="list-card">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <div>
              <strong>${item.name || 'Unnamed Key'}</strong><br>
              <span class="muted">${item.maskedKey || ''}</span><br>
              <span class="muted">type: ${item.keyType || 'sk'} · env: ${item.environment || 'live'} · role: ${item.role || '-'}</span><br>
              <span class="muted">tenantId: ${item.tenantId || 'global'} · owner: ${item.owner || '-'} · purpose: ${item.purpose || '-'}</span><br>
              <span class="muted">expires: ${item.expiresAt ? new Date(item.expiresAt).toLocaleString() : 'never'}</span><br>
              <span class="muted">usage count: ${item.usageCount ?? 0}</span><br>
              <span class="muted">scopes: ${(item.scopes || []).join(', ') || '-'}</span>
            </div>
            <div class="badge ${badgeClass(item.status)}">
              <span class="badge-dot"></span>${item.status || 'active'}
            </div>
          </div>

          <div class="actions">
            <button class="ghost-btn" type="button" data-copy="${item.key || ''}">Copy Key</button>
            <button class="ghost-btn" type="button" data-status="${item.id}" data-value="active">Enable</button>
            <button class="ghost-btn" type="button" data-status="${item.id}" data-value="disabled">Disable</button>
            <button class="danger-btn" type="button" data-status="${item.id}" data-value="revoked">Revoke</button>
            <button class="ghost-btn" type="button" data-rotate="${item.id}">Rotate</button>
            <button class="danger-btn" type="button" data-delete="${item.id}">Delete</button>
          </div>
        </div>
      `).join('') || '<div class="muted">No API keys found.</div>';

      document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const value = btn.getAttribute('data-copy');
          try {
            await navigator.clipboard.writeText(value);
            alert('API key copied');
          } catch {
            alert('Copy failed');
          }
        });
      });

      document.querySelectorAll('[data-status]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-status');
          const value = btn.getAttribute('data-value');

          try {
            const res = await apiFetch(`/api/api-keys/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: value })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update status');
            refresh();
          } catch (error) {
            alert(error.message);
          }
        });
      });

      document.querySelectorAll('[data-rotate]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-rotate');
          if (!confirm('Rotate this API key?')) return;

          try {
            const res = await apiFetch(`/api/api-keys/${id}/rotate`, {
              method: 'POST'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to rotate key');

            createdBox.textContent = JSON.stringify({
              message: data.message,
              name: data.item?.name,
              rawKey: data.rawKey,
              status: data.item?.status
            }, null, 2);

            refresh();
            USGShell.setupRawToggles(content);
          } catch (error) {
            alert(error.message);
          }
        });
      });

      document.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete');
          if (!confirm('Delete this API key?')) return;

          try {
            const res = await apiFetch(`/api/api-keys/${id}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete key');
            refresh();
          } catch (error) {
            alert(error.message);
          }
        });
      });
    } catch (error) {
      list.innerHTML = `<div class="muted">${error.message}</div>`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('api-key-name').value.trim(),
      owner: document.getElementById('api-key-owner').value.trim(),
      purpose: document.getElementById('api-key-purpose').value.trim(),
      role: document.getElementById('api-key-role').value,
      expiresAt: document.getElementById('api-key-expires').value || null,
      keyType: document.getElementById('api-key-type').value,
      environment: document.getElementById('api-key-environment').value,
      scopes: parseCsv(document.getElementById('api-key-scopes').value),
      ipWhitelist: parseCsv(document.getElementById('api-key-ip-whitelist').value)
    };

    try {
      const res = await apiFetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create API key');

      createdBox.textContent = JSON.stringify({
        name: data.name,
        tenantId: data.tenantId,
        keyType: data.keyType,
        environment: data.environment,
        rawKey: data.rawKey
      }, null, 2);

      form.reset();
      refresh();
      USGShell.setupRawToggles(content);
    } catch (error) {
      alert(error.message);
    }
  });

  refresh();
  USGShell.setupRawToggles(content);
}

loadApiKeys();
