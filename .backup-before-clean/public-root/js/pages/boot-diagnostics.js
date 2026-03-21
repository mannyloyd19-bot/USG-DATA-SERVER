requireAuth();
USGShell.buildShell();

async function loadBootDiagnostics() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'BOOT',
    title: 'Boot Diagnostics',
    subtitle: 'Runtime startup checks and machine diagnostics',
    actions: [{ label: 'Refresh', primary: true, onClick: () => loadBootDiagnostics() }]
  });

  try {
    const res = await apiFetch('/api/final-readiness/boot-status');
    const data = await res.json();

    content.innerHTML += `
      <div class="grid-3" style="margin-top:18px">
        ${USGPageKit.infoCard('Readiness', `${data.readinessPercent || 0}%`)}
        ${USGPageKit.infoCard('Platform', data.runtime?.platform || 'unknown')}
        ${USGPageKit.infoCard('Node', data.runtime?.nodeVersion || 'unknown')}
      </div>

      <section class="card" style="margin-top:24px">
        <div class="kicker">RUNTIME</div>
        <h2>Boot Status</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Boot Error', message: err.message, type: 'error' });
  }
}
loadBootDiagnostics();
