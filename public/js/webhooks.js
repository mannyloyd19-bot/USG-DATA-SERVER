requireAuth();

const formEl = document.getElementById('webhook-form');
const listEl = document.getElementById('webhook-list');

async function loadWebhooks() {
  listEl.innerHTML = '<div class="muted">Loading webhooks...</div>';

  try {
    const res = await apiFetch('/api/webhooks');
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      listEl.innerHTML = '<div class="muted">No webhooks configured.</div>';
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="item-card">
        <div><strong>${item.name}</strong></div>
        <div class="muted">${item.event}</div>
        <div class="muted">${item.url}</div>
        <div class="muted">active: ${item.isActive}</div>
      </div>
    `).join('');
  } catch (error) {
    listEl.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('webhook-name').value.trim(),
    url: document.getElementById('webhook-url').value.trim(),
    event: document.getElementById('webhook-event').value
  };

  try {
    const res = await apiFetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create webhook');

    formEl.reset();
    loadWebhooks();
  } catch (error) {
    alert(error.message);
  }
});

loadWebhooks();
