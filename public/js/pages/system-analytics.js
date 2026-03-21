requireAuth();
USGShell.buildShell();

function lineSvg(values = []) {
  const width = 300, height = 60;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');
  return `<div class="mini-line"><svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><polyline fill="none" stroke="currentColor" stroke-width="3" points="${points}" /></svg></div>`;
}

async function loadAnalytics() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SYSTEM',
    title: 'System Analytics',
    subtitle: 'Real platform analytics and health trends'
  });

  try {
    const res = await apiFetch('/api/platform-analytics/summary');
    const data = await res.json();
    const s = data.summary || {};
    const c = data.charts || {};

    content.innerHTML = `
      <div class="grid-4">
        ${USGPageKit.infoCard('Domains', s.domains || 0)}
        ${USGPageKit.infoCard('Backups', s.backups || 0)}
        ${USGPageKit.infoCard('API Keys', s.apiKeys || 0)}
        ${USGPageKit.infoCard('Tenants', s.tenants || 0)}
      </div>

      <div class="grid-3" style="margin-top:24px">
        <section class="card"><div class="kicker">REQUESTS</div><h2>Traffic</h2>${lineSvg(c.requests || [])}</section>
        <section class="card"><div class="kicker">ERRORS</div><h2>Error Trend</h2>${lineSvg(c.errors || [])}</section>
        <section class="card"><div class="kicker">BACKUPS</div><h2>Backup Activity</h2>${lineSvg(c.backups || [])}</section>
      </div>

      <section class="card" style="margin-top:24px">
        <div class="kicker">SUMMARY</div>
        <h2>Platform Snapshot</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Analytics Error', message: err.message, type: 'error' });
  }
}

loadAnalytics();
