requireAuth();
USGShell.buildShell();

async function loadFunctions() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'FUNCTIONS',
    title: 'Functions',
    subtitle: 'Server-side actions and automation functions'
  });

  try {
    const res = await apiFetch('/api/functions');
    const data = await res.json();
    const rows = data.functions || data.data || [];

    content.innerHTML += rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || 'Function'}</strong><br>
        <span class="muted">${item.description || ''}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No functions found' });
  } catch (err) {
    USGIOSAlert.show({ title: 'Functions Error', message: err.message, type: 'error' });
  }
}
loadFunctions();
