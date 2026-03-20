requireAuth();
USGShell.buildShell();

async function loadDomainsPage() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">DOMAIN CENTER</div>
      <h1 style="margin:6px 0 0;font-size:32px">USG Domain Simple Builder</h1>
      <div class="muted">Create a domain in simple mode. USG will auto-generate the public website address and internal domain key.</div>
    </section>

    <div class="grid-2" style="margin-top:18px">
      <section class="card">
        <div class="kicker">CREATE DOMAIN</div>
        <h2>Simple Builder</h2>
        <form id="domain-form">
          <input id="domain-name" placeholder="Domain Name (example: usgbackendsystem.usg)" required>
          <input id="domain-route" placeholder="App Route (example: /company)" required>

          <select id="domain-type">
            <option value="public">Public</option>
            <option value="internal">Internal</option>
          </select>

          <textarea id="domain-notes" rows="4" placeholder="Notes (optional)"></textarea>

          <div class="actions">
            <button class="primary-btn" type="submit">Create Domain</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">OUTPUT</div>
        <h2>Auto Generated Result</h2>
        <pre id="domain-preview-box">No domain created yet.</pre>
      </section>
    </div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">DOMAIN REGISTRY</div>
      <h2>Saved Domains</h2>
      <div id="domains-list">Loading...</div>
    </section>
  `;

  const form = document.getElementById('domain-form');
  const list = document.getElementById('domains-list');
  const preview = document.getElementById('domain-preview-box');

  async function loadPreview(id) {
    const res = await apiFetch(`/api/domains/${id}/preview`);
    const data = await res.json();
    preview.textContent = JSON.stringify(data.preview || {}, null, 2);
    USGShell.setupRawToggles(content);
  }

  async function refresh() {
    const res = await apiFetch('/api/domains');
    const data = await res.json();
    const rows = Array.isArray(data.domains) ? data.domains : [];

    list.innerHTML = rows.map(item => `
      <div class="list-card">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <strong>${item.name}</strong><br>
            <span class="muted">App Route: ${item.route}</span><br>
            <span class="muted">Public Website Address: ${item.publicUrl}</span><br>
            <span class="muted">Type: ${item.type}</span><br>
            <span class="muted">Status: ${item.status}</span><br>
            <span class="muted">Domain Key: ${item.domainKey || '-'}</span>
          </div>
          <div class="badge ${item.status === 'active' ? 'ok' : 'warn'}">
            <span class="badge-dot"></span>${item.status}
          </div>
        </div>

        <div class="actions">
          <button class="ghost-btn" type="button" data-preview="${item.id}">View</button>
          <button class="ghost-btn" type="button" data-toggle="${item.id}" data-status="${item.status}">${item.status === 'active' ? 'Disable' : 'Enable'}</button>
          <button class="danger-btn" type="button" data-delete="${item.id}">Delete</button>
        </div>
      </div>
    `).join('') || '<div class="muted">No domains found.</div>';

    document.querySelectorAll('[data-preview]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await loadPreview(btn.getAttribute('data-preview'));
      });
    });

    document.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-toggle');
        const current = btn.getAttribute('data-status');
        const next = current === 'active' ? 'disabled' : 'active';

        const res = await apiFetch(`/api/domains/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next })
        });

        const data = await res.json();
        preview.textContent = JSON.stringify(data.domain || data, null, 2);
        await refresh();
      });
    });

    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete');
        if (!confirm('Delete this domain?')) return;

        const res = await apiFetch(`/api/domains/${id}`, { method: 'DELETE' });
        const data = await res.json();
        preview.textContent = JSON.stringify(data, null, 2);
        await refresh();
      });
    });

    USGShell.setupRawToggles(content);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('domain-name').value.trim(),
      route: document.getElementById('domain-route').value.trim(),
      type: document.getElementById('domain-type').value,
      notes: document.getElementById('domain-notes').value.trim()
    };

    const res = await apiFetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to create domain');
      return;
    }

    preview.textContent = JSON.stringify({
      internalDomain: data.domain?.name,
      appRoute: data.domain?.route,
      publicWebsiteAddress: data.domain?.publicUrl,
      domainKey: data.domain?.domainKey,
      status: data.domain?.status
    }, null, 2);

    form.reset();
    document.getElementById('domain-type').value = 'public';
    await refresh();
  });

  document.getElementById('domain-type').value = 'public';
  await refresh();
}

loadDomainsPage();
