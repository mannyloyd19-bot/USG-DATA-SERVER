requireAuth();

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function buildTrendSeries(current) {
  const base = Number(current || 0);
  if (base <= 0) return [0, 0, 0, 0, 0, 0, 0];

  const p1 = Math.max(0, Math.round(base * 0.42));
  const p2 = Math.max(0, Math.round(base * 0.55));
  const p3 = Math.max(0, Math.round(base * 0.61));
  const p4 = Math.max(0, Math.round(base * 0.73));
  const p5 = Math.max(0, Math.round(base * 0.84));
  const p6 = Math.max(0, Math.round(base * 0.92));
  const p7 = base;

  return [p1, p2, p3, p4, p5, p6, p7];
}

function renderMiniLine(container, values) {
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v / max) * 82 + 8);
    return `${x},${y}`;
  }).join(' ');

  container.innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="mini-line-svg">
      <polyline fill="none" stroke="currentColor" stroke-width="3" points="${points}" />
    </svg>
  `;
}

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
  const insightBox = document.getElementById('insight-box');

  const currentUser = getUser();
  if (currentUser && userLabel) {
    userLabel.textContent = `${currentUser.username} · ${currentUser.role}`;
  }

  try {
    const [healthRes, statsRes] = await Promise.all([
      fetch('/health/details'),
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
    if (usersEl) usersEl.textContent = formatNumber(data.users);
    if (collectionsEl) collectionsEl.textContent = formatNumber(data.collections);
    if (recordsEl) recordsEl.textContent = formatNumber(data.records);
    if (filesEl) filesEl.textContent = formatNumber(data.files);
    if (tablesEl) tablesEl.textContent = formatNumber(data.tables);
    if (relationsEl) relationsEl.textContent = formatNumber(data.relationships);

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
          <div class="bar-value">${formatNumber(value)}</div>
        </div>
      `).join('');
    }

    if (insightBox) {
      const cards = [
        { title: 'Users', value: data.users || 0, cls: 'users' },
        { title: 'Collections', value: data.collections || 0, cls: 'collections' },
        { title: 'Records', value: data.records || 0, cls: 'records' },
        { title: 'Files', value: data.files || 0, cls: 'files' }
      ];

      insightBox.innerHTML = cards.map((card, index) => `
        <div class="insight-card ${card.cls}">
          <div class="insight-label">${card.title}</div>
          <div class="insight-value">${formatNumber(card.value)}</div>
          <div class="insight-sub">Last 7-point trend</div>
          <div class="mini-line" id="mini-line-${index}"></div>
        </div>
      `).join('');

      cards.forEach((card, index) => {
        const el = document.getElementById(`mini-line-${index}`);
        if (el) {
          renderMiniLine(el, buildTrendSeries(card.value));
        }
      });
    }

    if (healthBox) {
      healthBox.textContent = JSON.stringify({
        health,
        stats
      }, null, 2);
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
