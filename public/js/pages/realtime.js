window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadRealtime() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'REALTIME',
    title: 'Realtime',
    subtitle: 'Realtime channels and live event status'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Realtime Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-realtime-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-realtime-btn').onclick = () => loadRealtime();

  try {
    const res = await apiFetch('/api/realtime-insights/summary');
    const data = await res.json();
    const rows = data.realtime?.channels || [];

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name}</strong><br>
        <span class="muted">Events: ${item.events || 0}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(item.status || 'idle')}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No realtime channels found' });

    content.appendChild(listWrap);
  } catch (err) {
    USGIOSAlert.show({ title: 'Realtime Error', message: err.message, type: 'error' });
  }
}
loadRealtime();
