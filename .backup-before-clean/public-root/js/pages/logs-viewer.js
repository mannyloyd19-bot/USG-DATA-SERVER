requireAuth();
USGShell.buildShell();

async function loadLogsViewer() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'OBSERVABILITY',
    title: 'Logs Viewer',
    subtitle: 'Unified logs from platform runtime',
    actions: [{ label: 'Refresh', primary: true, onClick: () => loadLogsViewer() }]
  });

  content.innerHTML += USGPageKit.searchToolbar({ placeholder: 'Search logs...' });

  try {
    const res = await apiFetch('/api/platform-logs/unified?lines=120');
    const data = await res.json();
    const output = data.logs?.output || 'No logs available.';

    content.innerHTML += `
      <section class="card" style="margin-top:24px">
        <div class="kicker">UNIFIED LOGS</div>
        <h2>Runtime Output</h2>
        <pre id="logs-raw">${output}</pre>
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Logs Error', message: err.message, type: 'error' });
  }
}
loadLogsViewer();
