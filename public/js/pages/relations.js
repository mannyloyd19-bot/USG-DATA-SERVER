window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validateRelation(data) {
  const errors = [];
  if (!data.sourceCollectionId || !String(data.sourceCollectionId).trim()) errors.push('Source Collection ID is required');
  if (!data.targetCollectionId || !String(data.targetCollectionId).trim()) errors.push('Target Collection ID is required');
  if (!data.relationType || !String(data.relationType).trim()) errors.push('Relation Type is required');
  return errors;
}

async function loadRelations() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'RELATIONS',
    title: 'Relations',
    subtitle: 'Manage collection-to-collection relationships'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Relation Controls</h2>
      </div>
      <div class="actions">
        <button id="create-relation-btn" class="primary-btn" type="button">+ Create Relation</button>
        <button id="refresh-relations-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-relations-btn').onclick = () => loadRelations();
  document.getElementById('create-relation-btn').onclick = () => USGCrudKit.create({
    title: 'Create Relation',
    endpoint: '/api/relations',
    validate: validateRelation,
    fields: [
      { name: 'sourceCollectionId', label: 'Source Collection ID' },
      { name: 'targetCollectionId', label: 'Target Collection ID' },
      { name: 'relationType', label: 'Relation Type' },
      { name: 'label', label: 'Label' }
    ],
    onDone: () => loadRelations()
  });

  try {
    const res = await apiFetch('/api/relations');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.relationships || data.relations || data.data || []);

    const wrap = document.createElement('section');
    wrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.label || item.relationType || 'Relation'}</strong><br>
        <span class="muted">Source: ${item.sourceCollectionId || '-'}</span><br>
        <span class="muted">Target: ${item.targetCollectionId || '-'}</span><br>
        <span class="muted">Type: ${item.relationType || '-'}</span>
        <div class="actions">
          <button class="danger-btn" data-delete-relation="${item.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No relations found' });

    content.appendChild(wrap);

    rows.forEach(item => {
      const delBtn = document.querySelector(`[data-delete-relation="${item.id}"]`);
      if (delBtn) {
        delBtn.onclick = () => USGCrudKit.remove({
          title: 'Delete Relation',
          message: 'Delete this relation?',
          endpoint: `/api/relations/${item.id}`,
          onDone: () => loadRelations()
        });
      }
    });
  } catch (error) {
    USGIOSAlert.show({ title: 'Relations Error', message: error.message, type: 'error' });
  }
}

loadRelations();
