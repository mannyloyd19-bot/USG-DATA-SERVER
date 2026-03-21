requireAuth();
USGShell.buildShell();

async function loadDashboard() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'SYSTEM',
    title: 'Dashboard',
    subtitle: 'Overview of system health, usage, and activity'
  });

  content.innerHTML += USGPageKit.loadingState({ label: 'Loading dashboard...' });

  try {
    const res = await apiFetch('/api/dashboard');
    const data = await res.json();

    const stats = data.stats || {};

    content.innerHTML = `
      <div class="grid-3">
        ${USGPageKit.infoCard('Users', stats.users || 0)}
        ${USGPageKit.infoCard('Collections', stats.collections || 0)}
        ${USGPageKit.infoCard('Files', stats.files || 0)}
      </div>

      <section class="card" style="margin-top:20px">
        <h2>System Status</h2>
        <div>${USGPageKit.statusBadge('online')}</div>
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Dashboard Error', message: err.message, type: 'error' });
  }
}

loadDashboard();
