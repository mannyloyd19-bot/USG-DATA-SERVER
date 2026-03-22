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

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Relation Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-relations-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-relations-btn').onclick = () => loadRelations();

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search relations...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/relationships');
    const data = await res.json();
    const rows = data.relationships || data.relations || data.data || [];

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || item.type || 'Relation'}</strong><br>
        <span class="muted">${item.source || item.leftCollection || '-'} → ${item.target || item.rightCollection || '-'}</span>
        <div class="actions" style="margin-top:12px">
          ${USGPageKit.statusBadge(item.status || 'active')}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No relations found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});
  } catch (err) {
    USGIOSAlert.show({ title: 'Relations Error', message: err.message, type: 'error' });
  }
}
loadRelations();
