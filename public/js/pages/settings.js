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

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Settings Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-settings-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-settings-btn').onclick = () => loadSettings();

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search settings...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/settings');
    const data = await res.json();
    const rows = data.settings || data.data || [];

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.label || item.key}</strong><br>
        <span class="muted">${item.key}</span><br>
        <span>${typeof item.value === 'object' ? JSON.stringify(item.value) : (item.value ?? '')}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No settings found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});
  } catch (err) {
    USGIOSAlert.show({ title: 'Settings Error', message: err.message, type: 'error' });
  }
}
loadSettings();
