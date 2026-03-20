requireAuth();
USGShell.buildShell();

const content = document.getElementById('page-content');

content.innerHTML = `
<div class="card">
  <h2>Create Domain (.usg)</h2>
  <input id="name" placeholder="audit.usg">
  <input id="target" placeholder="/audit">
  <button id="create">Create</button>
</div>

<div class="card">
  <h2>Domains</h2>
  <div id="list"></div>
</div>
`;

async function load() {
  const res = await apiFetch('/api/domains');
  const data = await res.json();

  const list = document.getElementById('list');
  list.innerHTML = data.domains.map(d => `
    <div class="item">
      <b>${d.name}</b> → ${d.target}
      <button onclick="del('${d.id}')">Delete</button>
    </div>
  `).join('');
}

async function del(id){
  await apiFetch('/api/domains/' + id, { method: 'DELETE' });
  load();
}

document.getElementById('create').onclick = async () => {
  const name = document.getElementById('name').value;
  const target = document.getElementById('target').value;

  await apiFetch('/api/domains', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, target })
  });

  load();
};

load();
