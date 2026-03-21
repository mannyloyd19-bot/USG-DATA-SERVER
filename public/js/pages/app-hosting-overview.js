requireAuth();
USGShell.buildShell();

async function loadAppHostingOverview() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'HOSTING',
    title: 'App Hosting Overview',
    subtitle: 'Real hosted apps and deployment health'
  });

  try {
    const res = await apiFetch('/api/hosting-health/summary');
    const data = await res.json();
    const apps = data.hosting?.apps || [];
    const deps = data.hosting?.deployments || [];

    content.innerHTML += `
      <div class="grid-3" style="margin-top:18px">
        ${USGPageKit.infoCard('Apps', apps.length)}
        ${USGPageKit.infoCard('Deployments', deps.length)}
        ${USGPageKit.infoCard('Running', apps.filter(a => a.status === 'running').length)}
      </div>

      <section class="card" style="margin-top:24px">
        <div class="kicker">APP SERVICES</div>
        <h2>Hosted Applications</h2>
        ${apps.length ? apps.map(app => `
          <div class="list-card">
            <strong>${app.name}</strong><br>
            <span class="muted">port: ${app.port || '-'} · domain: ${app.domain || '-'} · entry: ${app.entry || '-'}</span>
            <div class="actions">${USGPageKit.statusBadge(app.status || 'stopped')}</div>
          </div>
        `).join('') : USGPageKit.emptyState({ title: 'No apps registered' })}
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Hosting Error', message: err.message, type: 'error' });
  }
}
loadAppHostingOverview();
