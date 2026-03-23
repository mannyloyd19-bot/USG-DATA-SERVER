window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'TENANT',
    title: 'Tenant Quotas Console',
    subtitle: 'Use this page for tenant quota and usage visibility.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">CONSOLE</div>
      <h2>Tenant Quotas Console</h2>
      <div class="muted">Use this page for tenant quota and usage visibility.</div>
    </section>
  `;
}

loadPage();
