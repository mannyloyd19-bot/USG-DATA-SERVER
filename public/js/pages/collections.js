requireAuth();
USGShell.buildShell();

async function loadCollections() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'DATABASE',
    title: 'Collections',
    subtitle: 'Manage data collections'
  });

  content.innerHTML += USGPageKit.loadingState();

  const res = await apiFetch('/api/collections');
  const data = await res.json();

  content.innerHTML += (data.collections || []).map(c => `
    <div class="list-card">
      <strong>${c.name}</strong><br>
      <span class="muted">${c.recordCount || 0} records</span>
    </div>
  `).join('');
}

loadCollections();
