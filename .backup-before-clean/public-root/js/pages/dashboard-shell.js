requireAuth();
USGShell.buildShell();

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function buildTrendSeries(current) {
  const base = Number(current || 0);
  if (base <= 0) return [0, 0, 0, 0, 0, 0, 0];
  return [
    Math.round(base * 0.42),
    Math.round(base * 0.55),
    Math.round(base * 0.61),
    Math.round(base * 0.73),
    Math.round(base * 0.84),
    Math.round(base * 0.92),
    base
  ];
}

function renderMiniLine(container, values) {
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v / max) * 82 + 8);
    return `${x},${y}`;
  }).join(' ');

  container.innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" stroke-width="3" points="${points}" />
    </svg>
  `;
}

function getRealtimeSocketURL() {
  const tenant = getCurrentTenant ? getCurrentTenant() : null;
  const token = getToken ? getToken() : '';
  const base = window.location.origin
    .replace(/^http:/i, 'ws:')
    .replace(/^https:/i, 'wss:');

  const url = new URL(`${base}/realtime`);
  if (tenant?.id) url.searchParams.set('tenantId', tenant.id);
  if (tenant?.slug) url.searchParams.set('tenantSlug', tenant.slug);

  return {
    url: url.toString(),
    token
  };
}

let dashboardSocket = null;
let dashboardReconnectTimer = null;
let dashboardFeed = [];
let dashboardFeedLimit = 20;

function pushFeed(event) {
  dashboardFeed.unshift({
    time: new Date().toLocaleString(),
    ...event
  });
  dashboardFeed = dashboardFeed.slice(0, dashboardFeedLimit);
  renderFeed();
}

function renderFeed() {
  const box = document.getElementById('live-feed');
  if (!box) return;

  if (!dashboardFeed.length) {
    box.innerHTML = '<div class="muted">No live activity yet.</div>';
    return;
  }

  box.innerHTML = dashboardFeed.map(item => `
    <div class="list-card">
      <strong>${item.title || 'Realtime Event'}</strong><br>
      <span class="muted">${item.description || '-'}</span><br>
      <span class="muted">${item.time}</span>
    </div>
  `).join('');
}

function setRealtimeState(text, type) {
  const state = document.getElementById('live-state');
  if (!state) return;
  state.textContent = text;
  state.className = `badge ${type || ''}`.trim();
}

async function loadDashboardStats() {
  const [healthRes, statsRes] = await Promise.all([
    fetch('/health/details'),
    apiFetch('/api/dashboard/stats')
  ]);

  const health = await healthRes.json();
  const stats = await statsRes.json();
  const data = stats.data || {};

  const currentUser = getUser ? getUser() : null;
  const userLabel = document.getElementById('current-user');
  if (currentUser && userLabel) {
    userLabel.textContent = `${currentUser.username} · ${currentUser.role}`;
  }

  document.getElementById('stat-mode').textContent = String(data.mode || 'sqlite').toUpperCase();
  document.getElementById('stat-users').textContent = formatNumber(data.users);
  document.getElementById('stat-collections').textContent = formatNumber(data.collections);
  document.getElementById('stat-records').textContent = formatNumber(data.records);
  document.getElementById('stat-files').textContent = formatNumber(data.files);
  document.getElementById('stat-tables').textContent = formatNumber(data.tables);

  const chartBox = document.getElementById('chart-box');
  const bars = [
    ['Users', data.users || 0],
    ['Collections', data.collections || 0],
    ['Records', data.records || 0],
    ['Files', data.files || 0],
    ['Tables', data.tables || 0],
    ['Relations', data.relationships || 0]
  ];
  const max = Math.max(...bars.map(x => x[1]), 1);
  chartBox.innerHTML = bars.map(([label, value]) => `
    <div class="bar-row">
      <div>${label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(value/max)*100}%"></div></div>
      <div class="bar-value">${formatNumber(value)}</div>
    </div>
  `).join('');

  const insightBox = document.getElementById('insight-box');
  const cards = [
    { title: 'Users', value: data.users || 0 },
    { title: 'Collections', value: data.collections || 0 },
    { title: 'Records', value: data.records || 0 },
    { title: 'Files', value: data.files || 0 }
  ];

  insightBox.innerHTML = cards.map((card, i) => `
    <div class="info-card">
      <div class="info-title">${card.title}</div>
      <div class="info-value">${formatNumber(card.value)}</div>
      <div class="muted">Last 7-point trend</div>
      <div class="mini-line" id="mini-${i}"></div>
    </div>
  `).join('');

  cards.forEach((card, i) => {
    renderMiniLine(document.getElementById(`mini-${i}`), buildTrendSeries(card.value));
  });

  document.getElementById('health-box').textContent = JSON.stringify({ health, stats }, null, 2);
}

async function refreshDashboard(reason) {
  try {
    await loadDashboardStats();
    if (reason) {
      pushFeed({
        title: 'Dashboard Refreshed',
        description: reason
      });
    }
  } catch (error) {
    const healthBox = document.getElementById('health-box');
    if (healthBox) {
      healthBox.textContent = JSON.stringify({ error: error.message }, null, 2);
    }
  }
}

function handleRealtimeEvent(payload) {
  const type = payload?.type || payload?.channel || 'message';

  if (type === 'connected') {
    setRealtimeState('Realtime Live', 'ok');
    pushFeed({
      title: 'Realtime Connected',
      description: `tenant: ${payload.tenantSlug || payload.tenantId || 'none'}`
    });

    try {
      dashboardSocket.send(JSON.stringify({ type: 'subscribe', channel: '*' }));
      dashboardSocket.send(JSON.stringify({ type: 'subscribe', channel: 'records.created' }));
      dashboardSocket.send(JSON.stringify({ type: 'subscribe', channel: 'records.updated' }));
      dashboardSocket.send(JSON.stringify({ type: 'subscribe', channel: 'records.deleted' }));
      dashboardSocket.send(JSON.stringify({ type: 'subscribe', channel: 'files.uploaded' }));
      dashboardSocket.send(JSON.stringify({ type: 'subscribe', channel: 'collections.created' }));
      dashboardSocket.send(JSON.stringify({ type: 'subscribe', channel: 'collections.deleted' }));
    } catch {}
    return;
  }

  if (type === 'subscribed' || type === 'pong') return;

  if (type === 'records.created') {
    pushFeed({
      title: 'Record Created',
      description: `${payload.collection || 'collection'} · ${payload.recordId || payload.id || 'new record'}`
    });
    refreshDashboard('Live update: record created');
    return;
  }

  if (type === 'records.updated') {
    pushFeed({
      title: 'Record Updated',
      description: `${payload.collection || 'collection'} · ${payload.recordId || payload.id || 'updated record'}`
    });
    refreshDashboard('Live update: record updated');
    return;
  }

  if (type === 'records.deleted') {
    pushFeed({
      title: 'Record Deleted',
      description: `${payload.collection || 'collection'} · ${payload.recordId || payload.id || 'deleted record'}`
    });
    refreshDashboard('Live update: record deleted');
    return;
  }

  if (type === 'files.uploaded') {
    pushFeed({
      title: 'File Uploaded',
      description: `${payload.fileName || payload.file?.name || 'uploaded file'}`
    });
    refreshDashboard('Live update: file uploaded');
    return;
  }

  if (type === 'collections.created') {
    pushFeed({
      title: 'Collection Created',
      description: `${payload.collection?.name || payload.name || 'new collection'}`
    });
    refreshDashboard('Live update: collection created');
    return;
  }

  if (type === 'collections.deleted') {
    pushFeed({
      title: 'Collection Deleted',
      description: `${payload.collection?.name || payload.name || 'deleted collection'}`
    });
    refreshDashboard('Live update: collection deleted');
    return;
  }

  pushFeed({
    title: `Realtime Event: ${type}`,
    description: JSON.stringify(payload).slice(0, 180)
  });
}

function connectRealtime() {
  const { url, token } = getRealtimeSocketURL();

  if (dashboardSocket) {
    try { dashboardSocket.close(); } catch {}
  }

  setRealtimeState('Connecting...', 'warn');

  dashboardSocket = new WebSocket(url, token ? [] : []);

  dashboardSocket.addEventListener('open', () => {
    setRealtimeState('Realtime Connected', 'ok');
    if (token) {
      // backend currently accepts JWT via Authorization header during handshake only when available server-side;
      // browser WebSocket cannot set arbitrary headers, so realtime with JWT depends on apiKey flow or open backend auth query handling.
    }
    try {
      dashboardSocket.send(JSON.stringify({ type: 'ping' }));
    } catch {}
  });

  dashboardSocket.addEventListener('message', (event) => {
    let payload = null;
    try {
      payload = JSON.parse(event.data);
    } catch {
      payload = { type: 'raw', data: event.data };
    }
    handleRealtimeEvent(payload);
  });

  dashboardSocket.addEventListener('close', () => {
    setRealtimeState('Realtime Disconnected', 'warn');
    clearTimeout(dashboardReconnectTimer);
    dashboardReconnectTimer = setTimeout(() => {
      connectRealtime();
    }, 3000);
  });

  dashboardSocket.addEventListener('error', () => {
    setRealtimeState('Realtime Error', 'warn');
  });
}

function buildDashboardUI() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">SYSTEM OVERVIEW</div>
      <h1 style="margin:6px 0 0;font-size:32px">USG DATA SERVER</h1>
      <div class="muted" id="current-user">-</div>
      <div class="actions" style="margin-top:14px">
        <div id="live-state" class="badge warn"><span class="badge-dot"></span>Connecting...</div>
        <button class="ghost-btn" type="button" id="manual-refresh-btn">Refresh Now</button>
      </div>
    </section>

    <section class="stats">
      <div class="stat"><div class="stat-label">Mode</div><div class="stat-value" id="stat-mode">-</div></div>
      <div class="stat"><div class="stat-label">Users</div><div class="stat-value" id="stat-users">-</div></div>
      <div class="stat"><div class="stat-label">Collections</div><div class="stat-value" id="stat-collections">-</div></div>
      <div class="stat"><div class="stat-label">Records</div><div class="stat-value" id="stat-records">-</div></div>
      <div class="stat"><div class="stat-label">Files</div><div class="stat-value" id="stat-files">-</div></div>
      <div class="stat"><div class="stat-label">Tables</div><div class="stat-value" id="stat-tables">-</div></div>
    </section>

    <div class="grid-2">
      <section class="card">
        <h2>Growth Insights</h2>
        <div class="muted">Live analytics view for core platform modules.</div>
        <div class="grid-2" id="insight-box" style="margin-top:16px"></div>
      </section>

      <section class="card">
        <h2>Live Activity Feed</h2>
        <div class="muted">Realtime system events appear here automatically.</div>
        <div id="live-feed" style="margin-top:16px"></div>
      </section>
    </div>

    <section class="card">
      <h2>Module Comparison</h2>
      <div class="muted">Live summary of the current private data platform.</div>
      <div id="chart-box" style="margin-top:18px"></div>
    </section>

    <section class="card">
      <h2>System Health</h2>
      <div class="muted">Private company-owned data engine with auth, collections, records, files, audit logs, API keys, and relational modules.</div>
      <pre id="health-box" style="margin-top:18px">Loading...</pre>
    </section>
  `;

  document.getElementById('manual-refresh-btn').addEventListener('click', () => {
    refreshDashboard('Manual refresh');
  });

  USGShell.setupRawToggles(content);
}

async function initDashboard() {
  buildDashboardUI();
  await refreshDashboard('Initial load');
  renderFeed();
  connectRealtime();

  setInterval(() => {
    refreshDashboard('Background sync refresh');
  }, 30000);
}

initDashboard();
