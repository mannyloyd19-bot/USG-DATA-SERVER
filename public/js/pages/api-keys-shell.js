requireAuth();
USGShell.buildShell();

async function loadApiKeys() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">ACCESS TOKENS</div>
        <h2>API Keys</h2>
        <form id="api-key-form">
          <input id="api-key-name" placeholder="API key name" required>
          <select id="api-key-role">
            <option value="admin">admin</option>
            <option value="super_admin">super_admin</option>
          </select>
          <div class="actions">
            <button class="primary-btn" type="submit">Create API Key</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">SECURITY NOTES</div>
        <h2>Usage</h2>
        <div class="list-card">
          <strong>Key Management</strong><br>
          <span class="muted">Create, review, and revoke access keys for integrations.</span>
        </div>
        <div class="list-card">
          <strong>Recommended</strong><br>
          <span class="muted">Use role-based keys and rotate old tokens regularly.</span>
        </div>
      </section>
    </div>

    <section class="card">
      <div class="kicker">CREATED KEYS</div>
      <h2>Key Registry</h2>
      <div id="api-key-list">Loading...</div>
    </section>
  `;

  const form = document.getElementById('api-key-form');
  const list = document.getElementById('api-key-list');

  async function refresh() {
    try {
      const res = await apiFetch('/api/api-keys');
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      list.innerHTML = rows.map(item => `
        <div class="list-card">
          <strong>${item.name || 'Unnamed Key'}</strong><br>
          <span class="muted">${item.key || item.token || ''}</span><br>
          <span class="muted">role: ${item.role || '-'} · active: ${String(item.isActive ?? true)}</span>
        </div>
      `).join('') || '<div class="muted">No API keys found.</div>';
    } catch (error) {
      list.innerHTML = `<div class="muted">${error.message}</div>`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('api-key-name').value.trim(),
      role: document.getElementById('api-key-role').value
    };

    try {
      await apiFetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      form.reset();
      refresh();
    } catch (error) {
      alert(error.message);
    }
  });

  refresh();
}

loadApiKeys();
