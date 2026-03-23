window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SSL',
    title: 'SSL Center',
    subtitle: 'Inspect SSL readiness, domain diagnostics, and related hosting health from this page.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">CONSOLE</div>
      <h2>SSL Center</h2>
      <div class="muted">Inspect SSL readiness, domain diagnostics, and related hosting health from this page.</div>
    </section>
  `;
}

loadPage();
