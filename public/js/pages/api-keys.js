requireAuth();
USGShell.buildShell();

async function loadKeys() {
  const content = document.getElementById('page-content');

  const res = await apiFetch('/api/api-keys');
  const data = await res.json();

  content.innerHTML = (data.keys || []).map(k => `
    <div class="list-card">
      <strong>${k.name}</strong>
      <div class="actions">
        <button data-rotate="${k.id}">Rotate</button>
        <button data-delete="${k.id}">Revoke</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-rotate]').forEach(btn => {
    btn.onclick = async () => {
      await apiFetch(`/api/api-keys/${btn.dataset.rotate}/rotate`, { method: 'POST' });
      loadKeys();
    };
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.onclick = async () => {
      const ok = await USGConfirm('Revoke key?');
      if (!ok) return;
      await apiFetch(`/api/api-keys/${btn.dataset.delete}`, { method: 'DELETE' });
      loadKeys();
    };
  });
}

loadKeys();
