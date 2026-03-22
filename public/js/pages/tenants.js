requireAuth();
USGShell.buildShell();

function validateTenant(data) {
  return USGValidationKit.collect(
    USGValidationKit.required(data.name, 'Tenant Name'),
    USGValidationKit.required(data.slug, 'Slug'),
    USGValidationKit.required(data.status, 'Status')
  );
}

async function loadTenants() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'TENANTS',
    title: 'Tenants',
    subtitle: 'Manage tenant accounts and workspaces'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Tenant Controls</h2>
      </div>
      <div class="actions">
        <button id="create-tenant-btn" class="primary-btn" type="button">+ Create Tenant</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('create-tenant-btn').onclick = () => USGCrudKit.create({
    title: 'Create Tenant',
    endpoint: '/api/tenants',
    validate: validateTenant,
    fields: [
      { name: 'name', label: 'Tenant Name' },
      { name: 'slug', label: 'Slug' },
      { name: 'status', label: 'Status' }
    ],
    onDone: () => loadTenants()
  });

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search tenants...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/tenants');
    const data = await res.json();
    const rows = data.tenants || [];

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(t => `
      <div class="list-card">
        <strong>${t.name || t.slug}</strong><br>
        <span class="muted">Slug: ${t.slug || ''}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(t.status || 'active')}
          <button class="ghost-btn" data-edit="${t.id}" type="button">Edit</button>
          <button class="danger-btn" data-delete="${t.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No tenants found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});

    rows.forEach(t => {
      const editBtn = document.querySelector(`[data-edit="${t.id}"]`);
      if (editBtn) {
        editBtn.onclick = () => USGCrudKit.edit({
          title: 'Edit Tenant',
          endpoint: `/api/tenants/${t.id}`,
          validate: validateTenant,
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
