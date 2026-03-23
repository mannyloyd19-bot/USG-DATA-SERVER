window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'INFRASTRUCTURE',
    title: 'Infrastructure Console',
    subtitle: 'Open infrastructure config, network, SSL, and hosting health tools from one place.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">CONSOLE</div>
      <h2>Infrastructure Console</h2>
      <div class="muted">Open infrastructure config, network, SSL, and hosting health tools from one place.</div>
    </section>
  `;
}

loadPage();
