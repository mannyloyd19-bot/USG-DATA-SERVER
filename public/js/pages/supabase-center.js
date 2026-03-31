window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

(function render() {
  const content = document.getElementById('page-content');
  USGPageKit.setPageHeader({
    kicker: 'FUTURE SYSTEMS',
    title: 'Supabase Center',
    subtitle: 'Workspace for Supabase database, auth, storage, edge functions, and migration support.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">OVERVIEW</div>
      <h2>Supabase Center</h2>
      <div class="muted">Planned features: project connection, auth sync, table import/export, policy comparison, and storage mirroring.</div>
    </section>
  `;
})();
