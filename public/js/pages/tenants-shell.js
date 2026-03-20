requireAuth();
USGShell.buildShell();

async function loadTenants() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">TENANT MANAGEMENT</div>
        <h2>Create Tenant</h2>
        <form id="tenant-form">
          <input id="tenant-name" placeholder="Tenant name" required>
          <input id="tenant-slug" placeholder="Tenant slug (optional)">
          <input id="tenant-owner-name" placeholder="Owner name">
          <input id="tenant-owner-email" placeholder="Owner email">
          <textarea id="tenant-notes" rows="5" placeholder="Notes"></textarea>
          <button class="primary-btn" type="submit">Create Tenant</button>
        </form>
      </section>

      <section class="card">
        <div class="kicker">CURRENT CONTEXT</div>
        <h2>Selected Tenant</h2>
        <pre id="tenant-current-box">Loading...</pre>
      </section>
    </div>

    <section class="card">
      <div class="kicker">TENANT REGISTRY</div>
      <h2>All Tenants</h2>
      <div id="tenant-list">Loading...</div>
    </section>
  `;

  const form = document.getElementById('tenant-form');
  const list = document.getElementById('tenant-list');
  const currentBox = document.getElementById('tenant-current-box');

  function renderCurrent() {
    currentBox.textContent = JSON.stringify(
      USGShell.getCurrentTenant() || { message: 'No tenant selected' },
      null,
      2
    );
    USGShell.setupRawToggles(content);
  }

  async function refresh() {
    try {
      const res = await apiFetch('/api/tenants');
      const rows = await res.json();
      const data = Array.isArray(rows) ? rows : [];

      list.innerHTML = data.map(item => `
        <div class="list-card">
          <strong>${item.name}</strong><br>
          <span class="muted">slug: ${item.slug}</span><br>
          <span class="muted">status: ${item.status} · owner: ${item.ownerName || '-'} · email: ${item.ownerEmail || '-'}</span><br>
          <span class="muted">${item.notes || ''}</span>

          <div class="actions">
            <button class="ghost-btn" type="button" data-select="${item.id}" data-slug="${item.slug}" data-name="${item.name}">Select</button>
            <button class="ghost-btn" type="button" data-status="${item.id}" data-value="active">Activate</button>
            <button class="ghost-btn" type="button" data-status="${item.id}" data-value="disabled">Disable</button>
            <button class="danger-btn" type="button" data-delete="${item.id}">Delete</button>
          </div>
        </div>
      `).join('') || '<div class="muted">No tenants found.</div>';

      document.querySelectorAll('[data-select]').forEach(btn => {
        btn.addEventListener('click', () => {
          USGShell.setCurrentTenant({
            id: btn.getAttribute('data-select'),
            slug: btn.getAttribute('data-slug'),
            name: btn.getAttribute('data-name')
          });
          renderCurrent();
          location.reload();
        });
      });

      document.querySelectorAll('[data-status]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-status');
          const value = btn.getAttribute('data-value');

          try {
            const res = await apiFetch(`/api/tenants/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: value })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update tenant');
            refresh();
          } catch (error) {
            alert(error.message);
          }
        });
      });

      document.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this tenant?')) return;
          const id = btn.getAttribute('data-delete');

          try {
            const res = await apiFetch(`/api/tenants/${id}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete tenant');
            refresh();
          } catch (error) {
            alert(error.message);
          }
        });
      });
    } catch (error) {
      list.innerHTML = `<div class="muted">${error.message}</div>`;
    }

    renderCurrent();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('tenant-name').value.trim(),
      slug: document.getElementById('tenant-slug').value.trim(),
      ownerName: document.getElementById('tenant-owner-name').value.trim(),
      ownerEmail: document.getElementById('tenant-owner-email').value.trim(),
      notes: document.getElementById('tenant-notes').value.trim()
    };

    try {
      const res = await apiFetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create tenant');

      form.reset();
      refresh();
    } catch (error) {
      alert(error.message);
    }
  });

  refresh();
}

loadTenants();
