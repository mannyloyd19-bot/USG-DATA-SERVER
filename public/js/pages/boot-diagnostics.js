window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'BOOT',
    title: 'Boot Diagnostics Console',
    subtitle: 'Inspect startup and readiness related diagnostics from this page.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">CONSOLE</div>
      <h2>Boot Diagnostics Console</h2>
      <div class="muted">Inspect startup and readiness related diagnostics from this page.</div>
    </section>
  `;
}

loadPage();
