requireAuth();
USGShell.buildShell();

async function loadSslCenter() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'SSL',
    title: 'SSL Center Pro',
    subtitle: 'Certificate, nginx, and renew readiness for the public gateway',
    actions: [{ label: 'Refresh', primary: true, onClick: () => loadSslCenter() }]
  });

  try {
    const res = await apiFetch('/api/ssl-center/status');
    const data = await res.json();

    content.innerHTML += `
      <div class="grid-3" style="margin-top:18px">
        ${USGPageKit.infoCard('Domain', data.ssl?.domain || 'N/A')}
        ${USGPageKit.infoCard('Certificate', data.ssl?.certExists ? 'Found' : 'Missing')}
        ${USGPageKit.infoCard('Private Key', data.ssl?.keyExists ? 'Found' : 'Missing')}
      </div>

      <section class="card" style="margin-top:24px">
        <div class="kicker">SSL STATUS</div>
        <h2>Certificate State</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'SSL Error', message: err.message, type: 'error' });
  }
}
loadSslCenter();
