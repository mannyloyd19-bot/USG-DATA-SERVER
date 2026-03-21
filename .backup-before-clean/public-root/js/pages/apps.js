requireAuth();
USGShell.buildShell();

async function loadApps() {
  const el = document.getElementById('page-content');

  el.innerHTML = `
    <section class="card">
      <h2>Create App</h2>
      <form id="form">
        <input id="name" placeholder="App name">
        <input id="port" placeholder="Port">
        <input id="domain" placeholder="domain.usg">
        <input id="entry" placeholder="entry file (app.js)">
        <button class="primary-btn">Create</button>
      </form>
    </section>

    <section class="card">
      <h2>Apps</h2>
      <div id="list"></div>
    </section>
  `;

  const list = document.getElementById('list');

  async function refresh() {
    const res = await apiFetch('/api/apps');
    const data = await res.json();

    list.innerHTML = data.apps.map(a => `
      <div class="list-card">
        <strong>${a.name}</strong> (${a.status})<br>
        port: ${a.port} | domain: ${a.domain || '-'}
        <div class="actions">
          <button onclick="start('${a.id}')">Start</button>
          <button onclick="stop('${a.id}')">Stop</button>
          <button onclick="restart('${a.id}')">Restart</button>
        </div>
      </div>
    `).join('');
  }

  window.start = async (id)=>{ await apiFetch(`/api/apps/${id}/start`,{method:'POST'}); refresh(); }
  window.stop = async (id)=>{ await apiFetch(`/api/apps/${id}/stop`,{method:'POST'}); refresh(); }
  window.restart = async (id)=>{ await apiFetch(`/api/apps/${id}/restart`,{method:'POST'}); refresh(); }

  document.getElementById('form').onsubmit = async (e)=>{
    e.preventDefault();
    await apiFetch('/api/apps',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        name:name.value,
        port:Number(port.value),
        domain:domain.value,
        entry:entry.value
      })
    });
    refresh();
  };

  refresh();
}

loadApps();
