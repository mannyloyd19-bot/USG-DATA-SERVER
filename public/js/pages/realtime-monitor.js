requireAuth();
USGShell.buildShell();

async function loadRealtimeMonitor() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'REALTIME',
    title: 'Realtime Monitor',
    subtitle: 'Live channel summary and event insights'
  });

  try {
    const res = await apiFetch('/api/realtime-insights/summary');
    const data = await res.json();
    const rt = data.realtime || {};
    const channels = rt.channels || [];

    content.innerHTML += `
      <div class="grid-3" style="margin-top:18px">
        ${USGPageKit.infoCard('Channels', channels.length)}
        ${USGPageKit.infoCard('Connected Clients', rt.connectedClients || 0)}
        ${USGPageKit.infoCard('Total Events', rt.totalEvents || 0)}
      </div>

      <section class="card" style="margin-top:24px">
        <div class="kicker">CHANNELS</div>
        <h2>Live Status</h2>
        ${channels.map(item => `
          <div class="list-card">
            <strong>${item.name}</strong><br>
            <span class="muted">events: ${item.events}</span>
            <div class="actions">${USGPageKit.statusBadge(item.status)}</div>
          </div>
        `).join('')}
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Realtime Error', message: err.message, type: 'error' });
  }
}
loadRealtimeMonitor();
