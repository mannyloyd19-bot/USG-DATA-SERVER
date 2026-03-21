requireAuth();
USGShell.buildShell();

async function loadRealtimeMonitor() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'REALTIME',
    title: 'Realtime Monitor',
    subtitle: 'Track live events, channels, and broadcast activity'
  });

  const synthetic = [
    { channel: 'collections', status: 'active', events: 24 },
    { channel: 'audit', status: 'active', events: 11 },
    { channel: 'tenants', status: 'idle', events: 2 }
  ];

  content.innerHTML += `
    <div class="grid-3" style="margin-top:18px">
      ${USGPageKit.infoCard('Channels', synthetic.length)}
      ${USGPageKit.infoCard('Active', synthetic.filter(x => x.status === 'active').length)}
      ${USGPageKit.infoCard('Events', synthetic.reduce((s, x) => s + x.events, 0))}
    </div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">CHANNEL STATUS</div>
      <h2>Realtime Channels</h2>
      ${synthetic.map(item => `
        <div class="list-card">
          <strong>${item.channel}</strong><br>
          <span class="muted">events: ${item.events}</span>
          <div class="actions">${USGPageKit.statusBadge(item.status)}</div>
        </div>
      `).join('')}
    </section>
  `;
}

loadRealtimeMonitor();
