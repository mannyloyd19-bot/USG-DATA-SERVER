requireAuth();
USGShell.buildShell();

async function loadEnvManager() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'ENV',
    title: 'Environment Manager',
    subtitle: 'View and update environment variables safely'
  });

  content.innerHTML += `
    <section class="card" style="margin-top:18px">
      <div class="kicker">ADD / UPDATE</div>
      <h2>Save Variable</h2>
      <input id="env-key" placeholder="ENV KEY">
      <input id="env-value" placeholder="ENV VALUE">
      <div class="actions">
        <button class="primary-btn" id="env-save">Save</button>
      </div>
    </section>

    <section class="card" style="margin-top:24px">
      <div class="kicker">CURRENT ENV</div>
      <h2>Variables</h2>
      <div id="env-list">Loading...</div>
    </section>
  `;

  async function refreshList() {
    const res = await apiFetch('/api/env-manager');
    const data = await res.json();
    const rows = data.env || [];
    document.getElementById('env-list').innerHTML = rows.length ? rows.map(row => `
      <div class="list-card">
        <strong>${row.key}</strong><br>
        <span class="muted">${row.value}</span>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No env variables found' });
  }

  document.getElementById('env-save').onclick = async () => {
    const payload = {
      key: document.getElementById('env-key').value.trim(),
      value: document.getElementById('env-value').value
    };
    const res = await apiFetch('/api/env-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      USGIOSAlert.show({ title: 'Env Save Failed', message: data.message || 'Failed', type: 'error' });
      return;
    }
    USGIOSAlert.show({ title: 'Saved', message: data.message || 'Env saved' });
    document.getElementById('env-key').value = '';
    document.getElementById('env-value').value = '';
    refreshList();
  };

  refreshList();
}
loadEnvManager();
