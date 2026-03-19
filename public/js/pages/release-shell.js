requireAuth();
USGShell.buildShell();

async function loadRelease() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2-wide">
      <section class="card">
        <div class="kicker">RELEASE LOCKDOWN</div>
        <h2>Runtime Flags</h2>
        <div id="release-actions"></div>
      </section>

      <section class="card">
        <div class="kicker">RELEASE STATE</div>
        <h2>Release Information</h2>
        <pre id="release-box">Loading...</pre>
      </section>
    </div>
  `;

  try {
    const res = await apiFetch('/api/system/release');
    const data = await res.json();
    const flags = data?.data || {};

    document.getElementById('release-actions').innerHTML = `
      <div class="flag-row"><strong>Release Lockdown</strong><span>${flags.releaseLockdown ? 'Enabled' : 'Disabled'}</span></div>
      <div class="flag-row"><strong>Installer</strong><span>${flags.installerEnabled ? 'Enabled' : 'Disabled'}</span></div>
      <div class="flag-row"><strong>Bootstrap</strong><span>${flags.bootstrapEnabled ? 'Enabled' : 'Disabled'}</span></div>
      <div class="flag-row"><strong>Environment</strong><span>${flags.environment || 'development'}</span></div>
    `;
    document.getElementById('release-box').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    document.getElementById('release-box').textContent = JSON.stringify({ error: error.message }, null, 2);
  }

  USGShell.setupRawToggles(content);
}

loadRelease();
