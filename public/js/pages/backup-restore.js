window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'BACKUP RESTORE',
    title: 'Backup Restore Console',
    subtitle: 'Use backup monitor, backups, and restore tools from this operational entry point.'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">CONSOLE</div>
      <h2>Backup Restore Console</h2>
      <div class="muted">Use backup monitor, backups, and restore tools from this operational entry point.</div>
    </section>
  `;
}

loadPage();
