requireAuth();

async function loadDashboard() {
  const modeEl = document.getElementById('stat-mode');
  const usersEl = document.getElementById('stat-users');
  const collectionsEl = document.getElementById('stat-collections');
  const recordsEl = document.getElementById('stat-records');
  const filesEl = document.getElementById('stat-files');
  const healthBox = document.getElementById('health-box');
  const userLabel = document.getElementById('current-user');
  const chartBox = document.getElementById('chart-box');

  const currentUser = getUser();
  if (currentUser) {
    userLabel.textContent = `${currentUser.username} · ${currentUser.role}`;
  }

  try {
    const [healthRes, statsRes] = await Promise.all([
      fetch('/health'),
      apiFetch('/api/dashboard/stats')
    ]);

    const health = await healthRes.json();
    const stats = await statsRes.json();

    modeEl.textContent = (stats.data && stats.data.mode ? stats.data.mode : 'sqlite').toUpperCase();
    usersEl.textContent = stats.data ? stats.data.users : '0';
    collectionsEl.textContent = stats.data ? stats.data.collections : '0';
    recordsEl.textContent = stats.data ? stats.data.records : '0';
    filesEl.textContent = stats.data ? stats.data.files : '0';

    const bars = [
      ['Users', stats.data?.users || 0],
      ['Collections', stats.data?.collections || 0],
      ['Records', stats.data?.records || 0],
      ['Files', stats.data?.files || 0]
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

    healthBox.textContent = JSON.stringify({
      health,
      info: stats
    }, null, 2);
  } catch (error) {
    healthBox.textContent = JSON.stringify({
      success: false,
      message: error.message
    }, null, 2);
  }
}

loadDashboard();
