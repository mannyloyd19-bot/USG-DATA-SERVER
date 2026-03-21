requireAuth();
USGShell.buildShell();

async function loadInstallWizard() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'INSTALL',
    title: 'Install Wizard',
    subtitle: 'Final setup checklist for PC and tablet deployment'
  });

  try {
    const [bootRes, lockRes] = await Promise.all([
      apiFetch('/api/final-readiness/boot-status'),
      apiFetch('/api/final-readiness/lock-status')
    ]);
    const boot = await bootRes.json();
    const lock = await lockRes.json();

    content.innerHTML += `
      <div class="grid-3" style="margin-top:18px">
        ${USGPageKit.infoCard('Readiness', `${boot.readinessPercent || 0}%`)}
        ${USGPageKit.infoCard('Environment', boot.runtime?.env || 'unknown')}
        ${USGPageKit.infoCard('Version', boot.runtime?.version || '1.0.0')}
      </div>

      <section class="card" style="margin-top:24px">
        <div class="kicker">CHECKLIST</div>
        <h2>Boot Diagnostics</h2>
        ${Object.entries(boot.checks || {}).map(([k,v]) => `
          <div class="flag-row">
            <strong>${k}</strong>
            <span>${v ? 'READY' : 'MISSING'}</span>
          </div>
        `).join('')}
      </section>

      <section class="card" style="margin-top:24px">
        <div class="kicker">SECURITY</div>
        <h2>Production Guardrails</h2>
        <pre>${JSON.stringify(lock, null, 2)}</pre>
      </section>

      <section class="card" style="margin-top:24px">
        <div class="kicker">DEPLOYMENT NOTES</div>
        <h2>Recommended Final Steps</h2>
        <div class="muted">
          1. Keep the PC powered on 24/7.<br>
          2. Run USG with PM2 or startup service.<br>
          3. Confirm DuckDNS and SSL are healthy.<br>
          4. Verify backups and restore flow.<br>
          5. Open the dashboard from browser on PC/tablet.
        </div>
      </section>
    `;
  } catch (err) {
    USGIOSAlert.show({ title: 'Install Wizard Error', message: err.message, type: 'error' });
  }
}
loadInstallWizard();
