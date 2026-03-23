window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'APP HEALTH',
    title: 'App Health Console',
    subtitle: 'Use this page as the operator entry point for app runtime, health, and deployment-related diagnostics.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">CONSOLE</div>
      <h2>App Health Console</h2>
      <div class="muted">Use this page as the operator entry point for app runtime, health, and deployment-related diagnostics.</div>
    </section>
  `;
}

loadPage();
