requireAuth();
USGShell.buildShell();

function lineSvg(values = []) {
  const width = 300;
  const height = 60;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');
  return `
    <div class="mini-line">
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <polyline fill="none" stroke="currentColor" stroke-width="3" points="${points}" />
      </svg>
    </div>
  `;
}

async function loadAnalytics() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SYSTEM',
    title: 'System Analytics',
    subtitle: 'Server usage, traffic patterns, and performance trends'
  });

  content.innerHTML += USGPageKit.loadingState({ label: 'Loading analytics...' });

  try {
    const metricsRes = await apiFetch('/api/system-metrics/metrics');
    const metricsData = await metricsRes.json();

    const m = metricsData.data || {};
    const mem = Number(m.memory?.usagePercent || 0);
    const cpuCores = Number(m.cpu?.cores || 0);

    const synthetic = {
      requests: [12, 18, 17, 26, 31, 28, 36],
      errors: [1, 0, 2, 1, 1, 0, 1],
      realtime: [4, 5, 8, 7, 9, 11, 10]
    };

    content.innerHTML = `
      <div class="grid-4">
        ${USGPageKit.infoCard('CPU Cores', cpuCores || 'N/A', m.cpu?.model || '')}
        ${USGPageKit.infoCard('Memory Usage', `${mem}%`)}
        ${USGPageKit.infoCard('Platform', m.system?.platform || 'N/A')}
        ${USGPageKit.infoCard('Uptime', `${((m.system?.uptime || 0) / 3600).toFixed(2)} hrs`)}
      </div>

      <div class="grid-3" style="margin-top:24px">
        <section class="card">
          <div class="kicker">REQUEST VOLUME</div>
          <h2>Requests Trend</h2>
          ${lineSvg(synthetic.requests)}
        </section>

        <section class="card">
          <div class="kicker">ERROR RATE</div>
          <h2>Error Events</h2>
          ${lineSvg(synthetic.errors)}
        </section>

        <section class="card">
          <div class="kicker">REALTIME</div>
          <h2>Realtime Events</h2>
          ${lineSvg(synthetic.realtime)}
        </section>
      </div>

      <section class="card" style="margin-top:24px">
        <div class="kicker">RAW METRICS</div>
        <h2>System Snapshot</h2>
        <pre>${JSON.stringify(metricsData, null, 2)}</pre>
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Analytics Error', message: err.message, type: 'error' });
  }
}

loadAnalytics();
