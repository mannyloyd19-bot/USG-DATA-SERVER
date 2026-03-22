window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

let realtimeSource = null;

function eventCard(evt) {
  return `
    <div class="list-card">
      <strong>${evt.type || 'event'}</strong><br>
      <span class="muted">Module: ${evt.module || '-'}</span><br>
      <span class="muted">Action: ${evt.action || '-'}</span><br>
      <span class="muted">Record: ${evt.recordId || '-'}</span><br>
      <span class="muted">${evt.emittedAt || ''}</span>
    </div>
  `;
}

function trimFeed(feed, limit = 30) {
  while (feed.children.length > limit) {
    feed.removeChild(feed.lastElementChild);
  }
}

async function loadRealtimeEvents() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'REALTIME',
    title: 'Realtime Events',
    subtitle: 'Live platform events and trigger activity'
  });

  content.innerHTML += `
    <section class="card">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>Event Stream</h2>
        </div>
        <div class="actions">
          <button id="emit-test-event" class="ghost-btn" type="button">Emit Test Event</button>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="kicker">LIVE FEED</div>
      <h2>Recent Events</h2>
      <div id="realtime-events-feed">Loading...</div>
    </section>
  `;

  const feed = document.getElementById('realtime-events-feed');

  async function refreshRecent() {
    try {
      const res = await apiFetch('/api/realtime-core/recent');
      const data = await res.json();
      const rows = data.events || [];
      feed.innerHTML = rows.length
        ? rows.map(eventCard).join('')
        : USGPageKit.emptyState({ title: 'No recent events' });
    } catch (error) {
      feed.innerHTML = `<div class="muted">${error.message}</div>`;
    }
  }

  document.getElementById('emit-test-event').onclick = async () => {
    await apiFetch('/api/realtime-core/emit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'manual.test',
        module: 'system',
        action: 'emit',
        data: { source: 'ui' }
      })
    });
  };

  await refreshRecent();

  try {
    if (realtimeSource) realtimeSource.close();

    realtimeSource = new EventSource('/api/realtime-core/stream');
    realtimeSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const html = eventCard(payload);

        if (feed.innerHTML.includes('No recent events') || feed.innerHTML === 'Loading...') {
          feed.innerHTML = html;
        } else {
          feed.innerHTML = html + feed.innerHTML;
        }

        trimFeed(feed, 30);
      } catch {}
    };
  } catch (error) {
    console.error('Realtime stream unavailable:', error);
  }
}

window.addEventListener('beforeunload', () => {
  if (realtimeSource) realtimeSource.close();
});

loadRealtimeEvents();
