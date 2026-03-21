requireAuth();
USGShell.buildShell();

async function loadSettings() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SETTINGS',
    title: 'System Settings',
    subtitle: 'Manage platform configuration values'
  });

  try {
    const res = await apiFetch('/api/settings');
    const data = await res.json();
    const rows = data.settings || data.data || [];

    content.innerHTML += rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.label || item.key}</strong><br>
        <span class="muted">${item.key}</span><br>
        <span>${typeof item.value === 'object' ? JSON.stringify(item.value) : (item.value ?? '')}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No settings found' });
  } catch (err) {
    USGIOSAlert.show({ title: 'Settings Error', message: err.message, type: 'error' });
  }
}
loadSettings();
