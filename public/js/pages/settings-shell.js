requireAuth();
USGShell.buildShell();

async function loadSettings() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">CONFIGURATION</div>
        <h2>Save Setting</h2>
        <div class="muted">Settings shell restored.</div>
      </section>

      <section class="card">
        <div class="kicker">CURRENT SETTINGS</div>
        <h2>Saved Configuration</h2>
        <pre id="settings-box">Settings page restored.</pre>
      </section>
    </div>
  `;
  USGShell.setupRawToggles(content);
}

loadSettings();
