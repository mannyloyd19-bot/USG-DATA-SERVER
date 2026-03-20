requireAuth();
USGShell.buildShell();

async function loadEnterpriseDb() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">DATABASE MODE</div>
        <h2>Current Runtime DB</h2>
        <pre id="db-info">Loading...</pre>
      </section>

      <section class="card">
        <div class="kicker">MIGRATION WIZARD</div>
        <h2>DB Migration Wizard</h2>

        <form id="migration-form">
          <input id="source-dialect" placeholder="Source Dialect" value="sqlite">

          <div class="row-top">
            <select id="target-dialect">
              <option value="mysql">mysql</option>
              <option value="postgres">postgres</option>
            </select>
            <input id="target-host" placeholder="Target Host" value="127.0.0.1">
          </div>

          <div class="row-top">
            <input id="target-port" placeholder="Target Port">
            <input id="target-database" placeholder="Target Database">
          </div>

          <div class="row-top">
            <input id="target-username" placeholder="Target Username">
            <input id="target-password" placeholder="Target Password" type="password">
          </div>

          <textarea id="migration-notes" rows="5" placeholder="Notes / migration remarks"></textarea>

          <div class="actions">
            <button class="primary-btn" type="button" id="save-draft-btn">Save Draft</button>
            <button class="ghost-btn" type="button" id="test-connection-btn">Test Connection</button>
            <button class="ghost-btn" type="button" id="dry-run-btn">Run Dry Run</button>
            <button class="danger-btn" type="button" id="run-migration-btn">Run Migration</button>
          </div>
        </form>
      </section>
    </div>

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">LATEST STATE</div>
        <h2>Migration Draft</h2>
        <pre id="migration-state-box">Loading...</pre>
      </section>

      <section class="card">
        <div class="kicker">RESULT</div>
        <h2>Migration Output</h2>
        <pre id="migration-plan-box">No migration action yet.</pre>
      </section>
    </div>
  `;

  const infoBox = document.getElementById('db-info');
  const stateBox = document.getElementById('migration-state-box');
  const planBox = document.getElementById('migration-plan-box');

  async function refreshInfo() {
    try {
      const [healthRes, latestRes] = await Promise.all([
        apiFetch('/health/details'),
        apiFetch('/api/db-migration/latest')
      ]);

      const health = await healthRes.json();
      const latest = await latestRes.json();

      infoBox.textContent = JSON.stringify({
        database: health?.data?.database || 'unknown',
        environment: health?.data?.environment || 'unknown',
        jwtConfigured: health?.data?.jwtConfigured || false,
        releaseLockdown: health?.data?.releaseLockdown || false
      }, null, 2);

      stateBox.textContent = JSON.stringify(latest || { message: 'No migration draft yet' }, null, 2);
      USGShell.setupRawToggles(content);
    } catch (error) {
      infoBox.textContent = JSON.stringify({ error: error.message }, null, 2);
      USGShell.setupRawToggles(content);
    }
  }

  function getPayload() {
    return {
      sourceDialect: document.getElementById('source-dialect').value.trim(),
      targetDialect: document.getElementById('target-dialect').value,
      targetHost: document.getElementById('target-host').value.trim(),
      targetPort: document.getElementById('target-port').value.trim(),
      targetDatabase: document.getElementById('target-database').value.trim(),
      targetUsername: document.getElementById('target-username').value.trim(),
      targetPassword: document.getElementById('target-password').value,
      notes: document.getElementById('migration-notes').value.trim()
    };
  }

  document.getElementById('save-draft-btn').addEventListener('click', async () => {
    try {
      const res = await apiFetch('/api/db-migration/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload())
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save migration draft');
      await refreshInfo();
      alert('Migration draft saved');
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById('test-connection-btn').addEventListener('click', async () => {
    try {
      const res = await apiFetch('/api/db-migration/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload())
      });
      const data = await res.json();
      planBox.textContent = JSON.stringify(data, null, 2);
      USGShell.setupRawToggles(content);
    } catch (error) {
      planBox.textContent = JSON.stringify({ error: error.message }, null, 2);
      USGShell.setupRawToggles(content);
    }
  });

  document.getElementById('dry-run-btn').addEventListener('click', async () => {
    try {
      const res = await apiFetch('/api/db-migration/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload())
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Dry run failed');
      planBox.textContent = JSON.stringify(data, null, 2);
      await refreshInfo();
      USGShell.setupRawToggles(content);
    } catch (error) {
      planBox.textContent = JSON.stringify({ error: error.message }, null, 2);
      USGShell.setupRawToggles(content);
    }
  });

  document.getElementById('run-migration-btn').addEventListener('click', async () => {
    if (!confirm('Run actual database migration now? Make sure the target DB is ready and backed up.')) {
      return;
    }

    try {
      planBox.textContent = 'Running migration...';
      const res = await apiFetch('/api/db-migration/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload())
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Migration failed');
      planBox.textContent = JSON.stringify(data, null, 2);
      await refreshInfo();
      USGShell.setupRawToggles(content);
    } catch (error) {
      planBox.textContent = JSON.stringify({ error: error.message }, null, 2);
      USGShell.setupRawToggles(content);
    }
  });

  refreshInfo();
}

loadEnterpriseDb();
