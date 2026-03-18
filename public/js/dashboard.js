requireAuth();

async function loadDashboard() {
  const modeEl = document.getElementById('stat-mode');
  const usersEl = document.getElementById('stat-users');
  const collectionsEl = document.getElementById('stat-collections');
  const recordsEl = document.getElementById('stat-records');
  const filesEl = document.getElementById('stat-files');
  const tablesEl = document.getElementById('stat-tables');
  const relationsEl = document.getElementById('stat-relations');
  const healthBox = document.getElementById('health-box');
  const userLabel = document.getElementById('current-user');
  const chartBox = document.getElementById('chart-box');

  const currentUser = getUser();
  if (currentUser && userLabel) {
    userLabel.textContent = `${currentUser.username} · ${currentUser.role}`;
  }

  try {
    const [healthRes, statsRes] = await Promise.all([
      fetch('/health'),
      apiFetch('/api/dashboard/stats')
    ]);

    let health = {};
    let stats = {};

    try { health = await healthRes.json(); } catch {}
    try { stats = await statsRes.json(); } catch {}

    if (!stats || !stats.data) {
      if (healthBox) {
        healthBox.textContent = JSON.stringify({
          success: false,
          message: 'Dashboard stats not available'
        }, null, 2);
      }
      return;
    }

    const data = stats.data || {};

    if (modeEl) modeEl.textContent = String(data.mode || 'sqlite').toUpperCase();
    if (usersEl) usersEl.textContent = data.users ?? 0;
    if (collectionsEl) collectionsEl.textContent = data.collections ?? 0;
    if (recordsEl) recordsEl.textContent = data.records ?? 0;
    if (filesEl) filesEl.textContent = data.files ?? 0;
    if (tablesEl) tablesEl.textContent = data.tables ?? 0;
    if (relationsEl) relationsEl.textContent = data.relationships ?? 0;

    if (chartBox) {
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
          <div class="bar-label">${label}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${(value / max) * 100}%"></div>
          </div>
          <div class="bar-value">${value}</div>
        </div>
      `).join('');
    }

    if (healthBox) {
      healthBox.textContent = JSON.stringify({ health, info: stats }, null, 2);
    }
  } catch (error) {
    if (healthBox) {
      healthBox.textContent = JSON.stringify({
        success: false,
        message: error.message
      }, null, 2);
    }
  }
}

loadDashboard();
