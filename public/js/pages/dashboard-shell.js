requireAuth();
USGShell.buildShell();

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

async function loadDashboard() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">SYSTEM OVERVIEW</div>
      <h1 style="margin:6px 0 0;font-size:32px">USG DATA SERVER</h1>
      <div class="muted" id="current-user">-</div>
    </section>

    <section class="stats">
      <div class="stat"><div class="stat-label">Mode</div><div class="stat-value" id="stat-mode">-</div></div>
      <div class="stat"><div class="stat-label">Users</div><div class="stat-value" id="stat-users">-</div></div>
      <div class="stat"><div class="stat-label">Collections</div><div class="stat-value" id="stat-collections">-</div></div>
      <div class="stat"><div class="stat-label">Records</div><div class="stat-value" id="stat-records">-</div></div>
      <div class="stat"><div class="stat-label">Files</div><div class="stat-value" id="stat-files">-</div></div>
      <div class="stat"><div class="stat-label">Tables</div><div class="stat-value" id="stat-tables">-</div></div>
    </section>

    <section class="card">
      <h2>System Health</h2>
      <div class="muted">Private company-owned data engine.</div>
      <pre id="health-box" style="margin-top:18px">Loading...</pre>
    </section>
  `;

  const currentUser = getUser();
  if (currentUser) {
    document.getElementById('current-user').textContent = `${currentUser.username} · ${currentUser.role}`;
  }

  try {
    const [healthRes, statsRes] = await Promise.all([
      fetch('/health/details'),
      apiFetch('/api/dashboard/stats')
    ]);

    const health = await healthRes.json();
    const stats = await statsRes.json();
    const data = stats.data || {};

    document.getElementById('stat-mode').textContent = String(data.mode || 'sqlite').toUpperCase();
    document.getElementById('stat-users').textContent = formatNumber(data.users);
    document.getElementById('stat-collections').textContent = formatNumber(data.collections);
    document.getElementById('stat-records').textContent = formatNumber(data.records);
    document.getElementById('stat-files').textContent = formatNumber(data.files);
    document.getElementById('stat-tables').textContent = formatNumber(data.tables);
    document.getElementById('health-box').textContent = JSON.stringify({ health, stats }, null, 2);
  } catch (error) {
    document.getElementById('health-box').textContent = JSON.stringify({ error: error.message }, null, 2);
  }

  USGShell.setupRawToggles(content);
}

loadDashboard();
