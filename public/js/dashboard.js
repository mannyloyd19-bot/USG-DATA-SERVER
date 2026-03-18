async function loadDashboard() {
  const modeEl = document.getElementById('stat-mode');
  const usersEl = document.getElementById('stat-users');
  const collectionsEl = document.getElementById('stat-collections');
  const recordsEl = document.getElementById('stat-records');
  const filesEl = document.getElementById('stat-files');
  const healthBox = document.getElementById('health-box');

  try {
    const [healthRes, statsRes] = await Promise.all([
      fetch('/health'),
      fetch('/api/dashboard/stats')
    ]);

    const health = await healthRes.json();
    const stats = await statsRes.json();

    modeEl.textContent = (stats.data && stats.data.mode ? stats.data.mode : 'sqlite').toUpperCase();
    usersEl.textContent = stats.data ? stats.data.users : '0';
    collectionsEl.textContent = stats.data ? stats.data.collections : '0';
    recordsEl.textContent = stats.data ? stats.data.records : '0';
    filesEl.textContent = stats.data ? stats.data.files : '0';

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
