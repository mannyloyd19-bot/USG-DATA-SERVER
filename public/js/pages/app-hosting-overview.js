requireAuth();
USGShell.buildShell();

async function loadAppHostingOverview() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'HOSTING',
    title: 'App Hosting Overview',
    subtitle: 'Inspect hosted apps, deployments, and app-level health'
  });

  try {
    const [appsRes, depRes] = await Promise.all([
      apiFetch('/api/apps'),
      apiFetch('/api/deployments')
    ]);

    const appsData = await appsRes.json();
    const depData = await depRes.json();
    const apps = appsData.apps || [];
    const deps = depData.deployments || [];

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
            <span class="muted">port: ${app.port || '-'} · domain: ${app.domain || '-'}</span>
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
