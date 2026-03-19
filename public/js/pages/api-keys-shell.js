requireAuth();
USGShell.buildShell();

function badgeClass(status) {
  if (status === 'active') return 'ok';
  if (status === 'disabled') return 'warn';
  return '';
}

async function loadApiKeys() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">ACCESS TOKENS</div>
        <h2>API Keys Pro</h2>
        <form id="api-key-form">
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
          <div class="actions">
            <button class="primary-btn" type="submit">Create API Key</button>
          </div>
        </form>
        <div class="kicker" style="margin-top:18px">NOTES</div>
        <div class="list-card">
          <strong>Security</strong><br>
          <span class="muted">Raw key is shown once after creation. Save it securely.</span>
        </div>
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
              <span class="muted">role: ${item.role || '-'} · owner: ${item.owner || '-'} · purpose: ${item.purpose || '-'}</span><br>
              <span class="muted">expires: ${item.expiresAt ? new Date(item.expiresAt).toLocaleString() : 'never'} · last used: ${item.lastUsedAt ? new Date(item.lastUsedAt).toLocaleString() : 'never'}</span>
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
      expiresAt: document.getElementById('api-key-expires').value || null
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
        role: data.role,
        owner: data.owner,
        purpose: data.purpose,
        rawKey: data.rawKey,
        expiresAt: data.expiresAt,
        status: data.status
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
