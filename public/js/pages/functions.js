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

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Function Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-functions-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-functions-btn').onclick = () => loadFunctions();

  try {
    const res = await apiFetch('/api/functions');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.functions || data.data || []);

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || 'Function'}</strong><br>
        <span class="muted">${item.description || 'Server-side handler'}</span>
        <div class="actions" style="margin-top:12px">
          ${USGPageKit.statusBadge(item.status || 'active')}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No functions found' });

    content.appendChild(listWrap);
  } catch (err) {
    USGIOSAlert.show({ title: 'Functions Error', message: err.message, type: 'error' });
  }
}
loadFunctions();
