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

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">TENANT REGISTRY</div>
        <h2>All Tenants</h2>
        <div id="tenant-list">Loading...</div>
      </section>

      <section class="card">
        <div class="kicker">TENANT MEMBERSHIPS</div>
        <h2>Members</h2>

        <form id="tenant-membership-form">
          <input id="membership-tenant-id" placeholder="Tenant ID" required>
          <input id="membership-user-id" placeholder="User ID" required>
          <div class="row-top">
            <select id="membership-role">
              <option value="owner">owner</option>
              <option value="admin">admin</option>
              <option value="member">member</option>
              <option value="viewer">viewer</option>
            </select>
            <select id="membership-status">
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
          </div>
          <button class="primary-btn" type="submit">Add Membership</button>
        </form>

        <div id="membership-list" style="margin-top:18px">Loading...</div>
      </section>
    </div>
  `;

  const form = document.getElementById('tenant-form');
  const list = document.getElementById('tenant-list');
  const currentBox = document.getElementById('tenant-current-box');

  const membershipForm = document.getElementById('tenant-membership-form');
  const membershipList = document.getElementById('membership-list');

  function renderCurrent() {
    currentBox.textContent = JSON.stringify(
      USGShell.getCurrentTenant() || { message: 'No tenant selected' },
      null,
      2
    );
    USGShell.setupRawToggles(content);
  }

  async function refreshMemberships() {
    try {
      const res = await apiFetch('/api/tenant-memberships');
      const rows = await res.json();
      const data = Array.isArray(rows) ? rows : [];

      membershipList.innerHTML = data.map(item => `
        <div class="list-card">
          <strong>${item.role}</strong><br>
          <span class="muted">tenantId: ${item.tenantId}</span><br>
          <span class="muted">userId: ${item.userId}</span><br>
          <span class="muted">status: ${item.status}</span>
          <div class="actions">
            <button class="ghost-btn" type="button" data-mstatus="${item.id}" data-value="active">Activate</button>
            <button class="ghost-btn" type="button" data-mstatus="${item.id}" data-value="disabled">Disable</button>
            <button class="danger-btn" type="button" data-mdelete="${item.id}">Delete</button>
          </div>
        </div>
      `).join('') || '<div class="muted">No tenant memberships found.</div>';

      document.querySelectorAll('[data-mstatus]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-mstatus');
          const value = btn.getAttribute('data-value');

          try {
            const res = await apiFetch(`/api/tenant-memberships/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: value })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update membership');
            refreshMemberships();
          } catch (error) {
            alert(error.message);
          }
        });
      });

      document.querySelectorAll('[data-mdelete]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this membership?')) return;
          const id = btn.getAttribute('data-mdelete');

          try {
            const res = await apiFetch(`/api/tenant-memberships/${id}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete membership');
            refreshMemberships();
          } catch (error) {
            alert(error.message);
          }
        });
      });
    } catch (error) {
      membershipList.innerHTML = `<div class="muted">${error.message}</div>`;
    }
  }

  async function refreshTenants() {
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
            refreshTenants();
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
            refreshTenants();
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
      refreshTenants();
    } catch (error) {
      alert(error.message);
    }
  });

  membershipForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      tenantId: document.getElementById('membership-tenant-id').value.trim(),
      userId: document.getElementById('membership-user-id').value.trim(),
      role: document.getElementById('membership-role').value,
      status: document.getElementById('membership-status').value
    };

    try {
      const res = await apiFetch('/api/tenant-memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create membership');

      membershipForm.reset();
      refreshMemberships();
    } catch (error) {
      alert(error.message);
    }
  });

  refreshTenants();
  refreshMemberships();
}

loadTenants();
