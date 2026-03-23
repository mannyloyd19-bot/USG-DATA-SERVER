requireAuth();
USGShell.buildShell();

function bucketCard(b) {
  return `
    <div class="list-card">
      <strong>${b.name}</strong><br>
      <span class="muted">ID: ${b.id}</span><br>
      <button class="primary-btn" data-open-bucket="${b.id}">Open</button>
    </div>
  `;
}

function fileCard(f) {
  return `
    <div class="list-card">
      <strong>${f.filename || f.name}</strong><br>
      <span class="muted">ID: ${f.id}</span><br>
      <div class="actions">
        <button class="ghost-btn" data-sign="${f.id}">Signed URL</button>
      </div>
    </div>
  `;
}

async function loadBuckets() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  const res = await apiFetch('/api/storage-admin/buckets');
  const data = await res.json();
  const buckets = data.buckets || [];

  content.innerHTML = `
    <section class="card">
      <h2>Storage Buckets</h2>
      ${buckets.map(bucketCard).join('')}
    </section>
  `;

  buckets.forEach(b => {
    const btn = document.querySelector(`[data-open-bucket="${b.id}"]`);
    if (btn) {
      btn.onclick = () => loadFiles(b.id);
    }
  });
}

async function loadFiles(bucketId) {
  const content = document.getElementById('page-content');

  const res = await apiFetch(`/api/storage-admin/buckets/${bucketId}/files`);
  const data = await res.json();
  const files = data.files || [];

  content.innerHTML = `
    <section class="card">
      <h2>Files</h2>
      ${files.map(fileCard).join('')}
    </section>
  `;

  files.forEach(f => {
    const btn = document.querySelector(`[data-sign="${f.id}"]`);
    if (btn) {
      btn.onclick = async () => {
        const r = await apiFetch(`/api/storage-admin/files/${f.id}/sign`, { method: 'POST' });
        const d = await r.json();
        alert(d.url);
      };
    }
  });
}

loadBuckets();
