requireAuth();

const listEl = document.getElementById('apikey-list');
const formEl = document.getElementById('apikey-form');

async function loadApiKeys() {
  listEl.innerHTML = '<div class="muted">Loading API keys...</div>';

  try {
    const res = await apiFetch('/api/api-keys');
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      listEl.innerHTML = '<div class="muted">No API keys yet.</div>';
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="item-card">
        <div><strong>${item.name}</strong></div>
        <div class="muted">${item.key}</div>
        <div class="muted">role: ${item.role} · active: ${item.isActive}</div>
      </div>
    `).join('');
  } catch (error) {
    listEl.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('apikey-name').value.trim(),
    role: document.getElementById('apikey-role').value
  };

  try {
    const res = await apiFetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create API key');

    formEl.reset();
    await loadApiKeys();
  } catch (error) {
    alert(error.message);
  }
});

loadApiKeys();
