requireAuth();

const feedEl = document.getElementById('realtime-feed');
const statusEl = document.getElementById('realtime-status');

function pushItem(item) {
  const div = document.createElement('div');
  div.className = 'feed-item';
  div.innerHTML = `
    <div><strong>${item.event || 'activity'}</strong></div>
    <div class="muted">${item.timestamp || new Date().toISOString()}</div>
    <pre>${JSON.stringify(item.data || item, null, 2)}</pre>
  `;

  feedEl.prepend(div);

  while (feedEl.children.length > 20) {
    feedEl.removeChild(feedEl.lastChild);
  }
}

function connectRealtime() {
  const token = getToken();
  if (!token) {
    location.href = '/login.html';
    return;
  }

  const url = `/api/realtime/stream?token=${encodeURIComponent(token)}`;
  const es = new EventSource(url);

  statusEl.textContent = 'Connecting...';

  es.addEventListener('connected', (event) => {
    statusEl.textContent = 'Connected';
    try {
      const data = JSON.parse(event.data);
      pushItem({ event: 'connected', data, timestamp: new Date().toISOString() });
    } catch {}
  });

  es.addEventListener('activity', (event) => {
    try {
      const data = JSON.parse(event.data);
      pushItem(data);
    } catch {}
  });

  es.onerror = () => {
    statusEl.textContent = 'Disconnected. Retrying...';
  };
}

connectRealtime();
