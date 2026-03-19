requireAuth();
USGShell.buildShell();

async function loadSettings() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">CONFIGURATION</div>
        <h2>Save Setting</h2>
        <form id="setting-form">
          <input id="setting-key" placeholder="Setting key, e.g. app.theme" required>
          <input id="setting-group" placeholder="Group, e.g. general">
          <input id="setting-label" placeholder="Label">
          <input id="setting-description" placeholder="Description">
          <textarea id="setting-value" rows="7" placeholder='"dark" or {"enabled":true}' required></textarea>
          <button class="primary-btn" type="submit">Save Setting</button>
        </form>
        <div class="kicker" style="margin-top:18px">SYSTEM INFO</div>
        <pre id="system-info-box">Loading...</pre>
      </section>

      <section class="card">
        <div class="kicker">CURRENT SETTINGS</div>
        <h2>Saved Configuration</h2>
        <div id="settings-list">Loading...</div>
      </section>
    </div>
  `;

  const form = document.getElementById('setting-form');
  const list = document.getElementById('settings-list');
  const sys = document.getElementById('system-info-box');

  async function refresh() {
    try {
      const [settingsRes, sysRes] = await Promise.all([
        apiFetch('/api/settings'),
        fetch('/health/details')
      ]);

      const settings = await settingsRes.json();
      const sysInfo = await sysRes.json();

      sys.textContent = JSON.stringify(sysInfo, null, 2);

      const rows = Array.isArray(settings) ? settings : [];
      list.innerHTML = rows.map(item => `
        <div class="list-card">
          <strong>${item.label || item.key}</strong><br>
          <span class="muted">${item.key}</span><br>
          <span class="muted">group: ${item.group || '-'}</span>
          <pre class="code-block">${typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2)}</pre>
        </div>
      `).join('') || '<div class="muted">No settings found.</div>';

      USGShell.setupRawToggles(content);
    } catch (error) {
      sys.textContent = JSON.stringify({ error: error.message }, null, 2);
      USGShell.setupRawToggles(content);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      key: document.getElementById('setting-key').value.trim(),
      group: document.getElementById('setting-group').value.trim(),
      label: document.getElementById('setting-label').value.trim(),
      description: document.getElementById('setting-description').value.trim(),
      value: document.getElementById('setting-value').value
    };

    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      form.reset();
      refresh();
    } catch (error) {
      alert(error.message);
    }
  });

  refresh();
}

loadSettings();
