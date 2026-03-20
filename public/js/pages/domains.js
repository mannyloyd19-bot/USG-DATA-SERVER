requireAuth();
USGShell.buildShell();

async function loadDomainsPage() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">DOMAIN ENGINE</div>
        <h2>Create Domain</h2>
        <form id="domain-form">
          <input id="domain-name" placeholder="audit.usg" required>
          <select id="domain-type">
            <option value="internal">internal</option>
            <option value="public">public</option>
          </select>
          <select id="domain-target-type">
            <option value="route">route</option>
            <option value="module">module</option>
            <option value="app">app</option>
          </select>
          <input id="domain-target" placeholder="/audit" required>
          <div class="actions">
            <button class="primary-btn" type="submit">Create Domain</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">DOMAIN INFO</div>
        <h2>Routing Preview</h2>
        <pre id="domain-preview-box">No domain created yet.</pre>
      </section>
    </div>

    <section class="card">
      <div class="kicker">DOMAIN REGISTRY</div>
      <h2>All Domains</h2>
      <div id="domains-list">Loading...</div>
    </section>
  `;

  const form = document.getElementById('domain-form');
  const list = document.getElementById('domains-list');
  const preview = document.getElementById('domain-preview-box');

  async function refresh() {
    try {
      const res = await apiFetch('/api/domains');
      const data = await res.json();
      const rows = Array.isArray(data.domains) ? data.domains : [];

      list.innerHTML = rows.map(item => `
        <div class="list-card">
          <strong>${item.name}</strong><br>
          <span class="muted">type: ${item.type || 'internal'} · target type: ${item.targetType || 'route'}</span><br>
          <span class="muted">target: ${item.target}</span><br>
          <span class="muted">status: ${item.isActive ? 'active' : 'inactive'}</span>

          <div class="actions">
            <button class="danger-btn" type="button" data-delete="${item.id}">Delete</button>
          </div>
        </div>
      `).join('') || '<div class="muted">No domains found.</div>';

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
      target: document.getElementById('domain-target').value.trim()
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
        domain: data.domain?.name,
        target: data.domain?.target,
        publicExample: data.domain?.name
          ? `${window.location.origin}/${data.domain.name.replace('.usg', '')}`
          : null
      }, null, 2);

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
