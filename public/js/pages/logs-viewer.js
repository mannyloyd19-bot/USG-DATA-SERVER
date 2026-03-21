requireAuth();
USGShell.buildShell();

async function loadLogsViewer() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'OBSERVABILITY',
    title: 'Logs Viewer',
    subtitle: 'Inspect runtime logs, recent failures, and service output',
    actions: [
      { label: 'Refresh', primary: true, onClick: () => loadLogsViewer() }
    ]
  });

  content.innerHTML += USGPageKit.searchToolbar({
    placeholder: 'Search logs...'
  });

  try {
    const res = await apiFetch('/api/runtime/pm2/logs?lines=120');
    const data = await res.json();
    const raw = JSON.stringify(data, null, 2);

    content.innerHTML += `
      <section class="card" style="margin-top:24px">
        <div class="kicker">RUNTIME LOGS</div>
        <h2>PM2 Logs</h2>
        <pre id="logs-raw">${raw}</pre>
      </section>
    `;

    USGPageKit.attachBasicSearch({
      itemSelector: '#logs-raw',
      textSelector: null
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'Logs Error', message: err.message, type: 'error' });
  }
}

loadLogsViewer();
