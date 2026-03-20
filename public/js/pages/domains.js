requireAuth();
USGShell.buildShell();

async function loadDomainsPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">DOMAIN CENTER</div>
      <h1 style="margin:6px 0 0;font-size:32px">USG Real Domain Module</h1>
      <div class="muted">Create production-style domains with service binding, route mapping, access mode, and real public address generation.</div>
    </section>

    <div class="grid-2" style="margin-top:18px">
      <section class="card">
        <div class="kicker">DOMAIN BUILDER</div>
        <h2>Create Domain</h2>
        <form id="domain-form">
          <input id="name" placeholder="Domain Name (example: usgbackendsystem.usg)" required>
          <input id="serviceName" placeholder="App / Service Target (example: USG BACKEND SYSTEM)" required>
          <input id="routePath" placeholder="Route Path (example: /company)" required>

          <div class="row-top">
            <select id="accessMode">
              <option value="public">Public via USG</option>
              <option value="internal">Internal Only</option>
            </select>

            <select id="environment">
              <option value="production">production</option>
              <option value="staging">staging</option>
              <option value="development">development</option>
            </select>
          </div>

          <textarea id="notes" rows="4" placeholder="Notes (optional)"></textarea>

          <div class="actions">
            <button class="primary-btn" type="submit">Create Domain</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">DOMAIN DETAILS</div>
        <h2>Selected Domain</h2>
        <pre id="details-box">No domain selected yet.</pre>
      </section>
    </div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">DOMAIN REGISTRY</div>
      <h2>Saved Domains</h2>
      <div id="registry-box">Loading...</div>
    </section>
  `;

  const form = document.getElementById('domain-form');
  const registryBox = document.getElementById('registry-box');
  const detailsBox = document.getElementById('details-box');

  async function loadDetails(id) {
    const res = await apiFetch(`/api/domains/${id}/details`);
    const data = await res.json();
    detailsBox.textContent = JSON.stringify(data.details || data, null, 2);
    USGShell.setupRawToggles(content);
  }

  async function refresh() {
    const res = await apiFetch('/api/domains');
    const data = await res.json();
    const rows = Array.isArray(data.domains) ? data.domains : [];

    registryBox.innerHTML = rows.map(item => `
      <div class="list-card">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <strong>${item.name}</strong><br>
            <span class="muted">Service: ${item.serviceName || '-'}</span><br>
            <span class="muted">Route: ${item.routePath}</span><br>
            <span class="muted">Public Address: ${item.publicAddress}</span><br>
            <span class="muted">Access: ${item.accessMode} · Environment: ${item.environment}</span><br>
            <span class="muted">SSL: ${item.sslStatus} · Status: ${item.status}</span><br>
            <span class="muted">Domain Key: ${item.domainKey || '-'}</span>
          </div>
          <div class="badge ${item.status === 'active' ? 'ok' : 'warn'}">
            <span class="badge-dot"></span>${item.status}
          </div>
        </div>

        <div class="actions">
          <button class="ghost-btn" type="button" data-view="${item.id}">View</button>
          <button class="ghost-btn" type="button" data-toggle="${item.id}" data-status="${item.status}">${item.status === 'active' ? 'Disable' : 'Enable'}</button>
          <button class="danger-btn" type="button" data-delete="${item.id}">Delete</button>
        </div>
      </div>
    `).join('') || '<div class="muted">No domains found.</div>';

    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await loadDetails(btn.getAttribute('data-view'));
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
        detailsBox.textContent = JSON.stringify(data.domain || data, null, 2);
        await refresh();
      });
    });

    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete');
        if (!confirm('Delete this domain?')) return;
        const res = await apiFetch(`/api/domains/${id}`, { method: 'DELETE' });
        const data = await res.json();
        detailsBox.textContent = JSON.stringify(data, null, 2);
        await refresh();
      });
    });

    USGShell.setupRawToggles(content);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('name').value.trim(),
      serviceName: document.getElementById('serviceName').value.trim(),
      routePath: document.getElementById('routePath').value.trim(),
      accessMode: document.getElementById('accessMode').value,
      environment: document.getElementById('environment').value,
      notes: document.getElementById('notes').value.trim()
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

    detailsBox.textContent = JSON.stringify({
      internalDomain: data.domain?.name,
      boundService: data.domain?.serviceName,
      targetRoute: data.domain?.routePath,
      publicWebsiteAddress: data.domain?.publicAddress,
      domainKey: data.domain?.domainKey,
      status: data.domain?.status
    }, null, 2);

    form.reset();
    document.getElementById('accessMode').value = 'public';
    document.getElementById('environment').value = 'production';
    await refresh();
  });

  document.getElementById('accessMode').value = 'public';
  document.getElementById('environment').value = 'production';
  await refresh();
}

loadDomainsPage();
