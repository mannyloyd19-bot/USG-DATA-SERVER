requireAuth();
USGShell.buildShell();

async function loadDeploymentsPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">AUTO DEPLOY</div>
      <h1 style="margin:6px 0 0;font-size:32px">Deployment Center</h1>
      <div class="muted">Register app paths, set build/start commands, deploy with PM2, and manage app lifecycle in one place.</div>
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="kicker">REGISTER APP</div>
        <h2>Deployment Config</h2>
        <form id="deploy-form">
          <input id="appName" placeholder="App name" required>
          <input id="appPath" placeholder="/workspaces/MY-APP" required>
          <input id="pm2Name" placeholder="PM2 name" required>
          <input id="port" type="number" placeholder="Port (optional)">
          <input id="domain" placeholder="domain.usg or subdomain">
          <input id="buildCommand" placeholder="Build command (example: npm install && npm run build)">
          <input id="startCommand" placeholder="Start command (example: npm run dev)" value="npm run dev">
          <div class="actions">
            <button class="primary-btn" type="submit">Save Deployment</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">DEPLOY OUTPUT</div>
        <h2>Last Result</h2>
        <pre id="deploy-output">No deployment yet.</pre>
      </section>
    </div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">SERVICE REGISTRY</div>
      <h2>Registered Apps</h2>
      <div id="deploy-list">Loading...</div>
    </section>
  `;

  const form = document.getElementById('deploy-form');
  const list = document.getElementById('deploy-list');
  const output = document.getElementById('deploy-output');

  async function refresh() {
    const res = await apiFetch('/api/deployments');
    const data = await res.json();
    const rows = Array.isArray(data.deployments) ? data.deployments : [];

    list.innerHTML = rows.map(item => `
      <div class="list-card">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <strong>${item.appName}</strong><br>
            <span class="muted">path: ${item.appPath}</span><br>
            <span class="muted">pm2: ${item.pm2Name} · status: ${item.status}</span><br>
            <span class="muted">port: ${item.port || '-'} · domain: ${item.domain || '-'}</span><br>
            <span class="muted">build: ${item.buildCommand || '-'} </span><br>
            <span class="muted">start: ${item.startCommand || '-'}</span>
          </div>
          <div class="badge ${item.status === 'running' ? 'ok' : 'warn'}">
            <span class="badge-dot"></span>${item.status}
          </div>
        </div>

        <div class="actions">
          <button class="primary-btn" type="button" data-deploy="${item.id}">Deploy</button>
          <button class="ghost-btn" type="button" data-restart="${item.id}">Restart</button>
          <button class="ghost-btn" type="button" data-stop="${item.id}">Stop</button>
          <button class="danger-btn" type="button" data-delete="${item.id}">Delete</button>
        </div>
      </div>
    `).join('') || '<div class="muted">No deployments found.</div>';

    document.querySelectorAll('[data-deploy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-deploy');
        output.textContent = 'Deploying...';
        const res = await apiFetch(`/api/deployments/${id}/deploy`, { method: 'POST' });
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);
        await refresh();
        USGShell.setupRawToggles(content);
      });
    });

    document.querySelectorAll('[data-restart]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-restart');
        const res = await apiFetch(`/api/deployments/${id}/restart`, { method: 'POST' });
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);
        await refresh();
        USGShell.setupRawToggles(content);
      });
    });

    document.querySelectorAll('[data-stop]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-stop');
        const res = await apiFetch(`/api/deployments/${id}/stop`, { method: 'POST' });
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);
        await refresh();
        USGShell.setupRawToggles(content);
      });
    });

    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete');
        if (!confirm('Delete this deployment?')) return;
        const res = await apiFetch(`/api/deployments/${id}`, { method: 'DELETE' });
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);
        await refresh();
        USGShell.setupRawToggles(content);
      });
    });

    USGShell.setupRawToggles(content);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      appName: document.getElementById('appName').value.trim(),
      appPath: document.getElementById('appPath').value.trim(),
      pm2Name: document.getElementById('pm2Name').value.trim(),
      port: Number(document.getElementById('port').value || 0) || null,
      domain: document.getElementById('domain').value.trim(),
      buildCommand: document.getElementById('buildCommand').value.trim(),
      startCommand: document.getElementById('startCommand').value.trim()
    };

    const res = await apiFetch('/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
    form.reset();
    document.getElementById('startCommand').value = 'npm run dev';
    await refresh();
    USGShell.setupRawToggles(content);
  });

  await refresh();
}

loadDeploymentsPage();
