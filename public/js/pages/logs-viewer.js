window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function card(title, desc, href) {
  return `
    <div class="list-card">
      <strong>${title}</strong><br>
      <span class="muted">${desc}</span>
      <div class="actions">
        <a class="primary-btn" href="${href}">Open</a>
      </div>
    </div>
  `;
}

async function loadLogsHub() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'LOGS',
    title: 'Logs Console',
    subtitle: 'Central entry point for runtime logs, app logs, and diagnostics'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">TOOLS</div>
      <h2>Log Modules</h2>
      ${card('Log Viewer', 'Buffered platform and request logs.', '/pages/log-viewer.html')}
      ${card('App Logs', 'App-specific log stream and runtime summary.', '/pages/app-logs.html')}
      ${card('Diagnostics', 'Runtime console and deeper debug visibility.', '/pages/diagnostics-console.html')}
    </section>
  `;
}
loadLogsHub();
