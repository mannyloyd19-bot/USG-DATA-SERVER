requireAuth();
USGShell.buildShell();

async function loadTenants() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'TENANTS',
    title: 'Tenants',
    subtitle: 'Manage tenant accounts and workspaces',
    actions: [
      {
        label: '+ Create Tenant',
        primary: true,
        onClick: () => USGCrudKit.create({
          title: 'Create Tenant',
          endpoint: '/api/tenants',
          fields: [
            { name: 'name', label: 'Tenant Name' },
            { name: 'slug', label: 'Slug' },
            { name: 'status', label: 'Status' }
          ],
          onDone: () => loadTenants()
        })
      }
    ]
  });

  try {
    const res = await apiFetch('/api/tenants');
    const data = await res.json();
    const rows = data.tenants || [];

    content.innerHTML += rows.length ? rows.map(t => `
      <div class="list-card">
        <strong>${t.name || t.slug}</strong><br>
        <span class="muted">${t.slug || ''}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(t.status || 'active')}
          <button class="ghost-btn" data-edit="${t.id}">Edit</button>
          <button class="danger-btn" data-delete="${t.id}">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No tenants found' });

    rows.forEach(t => {
      const editBtn = document.querySelector(`[data-edit="${t.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit Tenant',
          endpoint: `/api/tenants/${t.id}`,
          initial: {
            name: t.name || '',
            slug: t.slug || '',
            status: t.status || ''
          },
          fields: [
            { name: 'name', label: 'Tenant Name' },
            { name: 'slug', label: 'Slug' },
            { name: 'status', label: 'Status' }
          ],
          onDone: () => loadTenants()
        });
      }

      const delBtn = document.querySelector(`[data-delete="${t.id}"]`);
      if (delBtn) {
        delBtn.onclick = () => USGCrudKit.remove({
          title: 'Delete Tenant',
          message: 'Delete this tenant?',
          endpoint: `/api/tenants/${t.id}`,
          onDone: () => loadTenants()
        });
      }
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'Tenants Error', message: err.message, type: 'error' });
  }
}
loadTenants();
