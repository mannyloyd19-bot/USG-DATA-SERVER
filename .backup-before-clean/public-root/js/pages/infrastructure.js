requireAuth();
USGShell.buildShell();

async function loadInfra() {
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <h1>Infrastructure Center</h1>
    <div id="metrics">Loading...</div>
  `;

  const res = await apiFetch('/api/system/metrics');
  const data = await res.json();

  const m = data.data;

  document.getElementById('metrics').innerHTML = `
    <div class="card">
      <h3>CPU</h3>
      <p>${m.cpu.model}</p>
      <p>Cores: ${m.cpu.cores}</p>
    </div>

    <div class="card">
      <h3>Memory</h3>
      <p>Used: ${(m.memory.used / 1024 / 1024).toFixed(2)} MB</p>
      <p>Total: ${(m.memory.total / 1024 / 1024).toFixed(2)} MB</p>
      <p>Usage: ${m.memory.usagePercent}%</p>
    </div>

    <div class="card">
      <h3>System</h3>
      <p>Platform: ${m.system.platform}</p>
      <p>Uptime: ${(m.system.uptime / 3600).toFixed(2)} hrs</p>
    </div>
  `;
}

loadInfra();
