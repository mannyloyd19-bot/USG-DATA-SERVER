requireAuth();
USGShell.buildShell();

async function loadRelations() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'RELATIONS',
    title: 'Relations',
    subtitle: 'View relation structures and linked resources'
  });

  try {
    const res = await apiFetch('/api/relationships');
    const data = await res.json();
    const rows = data.relationships || data.relations || data.data || [];

    content.innerHTML += rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.type || 'Relation'}</strong><br>
        <span class="muted">${item.source || item.leftCollection || ''} → ${item.target || item.rightCollection || ''}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No relations found' });
  } catch (err) {
    USGIOSAlert.show({ title: 'Relations Error', message: err.message, type: 'error' });
  }
}
loadRelations();
