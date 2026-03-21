requireAuth();

const formEl = document.getElementById('function-form');
const listEl = document.getElementById('function-list');

async function loadFunctions() {
  listEl.innerHTML = 'Loading...';

  const res = await apiFetch('/api/functions');
  const items = await res.json();

  listEl.innerHTML = items.map(f => `
    <div class="item-card">
      <strong>${f.name}</strong>
      <div>${f.event}</div>
      <pre>${f.code}</pre>
    </div>
  `).join('');
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('fn-name').value,
    event: document.getElementById('fn-event').value,
    code: document.getElementById('fn-code').value
  };

  await apiFetch('/api/functions', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });

  formEl.reset();
  loadFunctions();
});

loadFunctions();
