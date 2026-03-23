window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'REALTIME',
    title: 'Realtime Monitor Console',
    subtitle: 'Open realtime events, monitoring, and logs from this consolidated page.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">CONSOLE</div>
      <h2>Realtime Monitor Console</h2>
      <div class="muted">Open realtime events, monitoring, and logs from this consolidated page.</div>
    </section>
  `;
}

loadPage();
