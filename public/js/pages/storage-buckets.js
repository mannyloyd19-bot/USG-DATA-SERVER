window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validateBucket(data) {
  return USGValidationKit.collect(
    USGValidationKit.required(data.name, 'Bucket Name'),
    USGValidationKit.required(data.visibility, 'Visibility')
  );
}

async function copyText(value, title = 'Copied') {
  try {
    await navigator.clipboard.writeText(value || '');
    USGIOSAlert.show({ title: 'Copied', message: title });
  } catch {
    USGIOSAlert.show({ title: 'Copy Failed', message: title, type: 'error' });
  }
}

async function loadBuckets() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'STORAGE',
    title: 'Storage Buckets',
    subtitle: 'Manage public and private storage buckets with signed access'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Bucket Controls</h2>
      </div>
      <div class="actions">
        <button id="create-bucket-btn" class="primary-btn" type="button">+ Create Bucket</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('create-bucket-btn').onclick = () => USGCrudKit.create({
    title: 'Create Bucket',
    endpoint: '/api/storage-buckets',
    validate: validateBucket,
    fields: [
      { name: 'name', label: 'Bucket Name' },
      { name: 'slug', label: 'Slug' },
      { name: 'visibility', label: 'Visibility (public/private)' },
      { name: 'description', label: 'Description' }
    ],
    onDone: () => loadBuckets()
  });

  try {
    const res = await apiFetch('/api/storage-buckets');
    const data = await res.json();
    const rows = data.buckets || [];

    const listWrap = document.createElement('section');
    listWrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name}</strong><br>
        <span class="muted">Slug: ${item.slug}</span><br>
        <span class="muted">Visibility: ${item.visibility}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(item.visibility || 'private')}
          <button class="ghost-btn" data-copy-bucket="${item.slug}" type="button">Copy Slug</button>
          <button class="ghost-btn" data-open-bucket="${item.id}" type="button">Files</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No buckets found' });

    content.appendChild(listWrap);

    document.querySelectorAll('[data-copy-bucket]').forEach(btn => {
      btn.onclick = () => copyText(btn.dataset.copyBucket, 'Bucket slug copied');
    });

    document.querySelectorAll('[data-open-bucket]').forEach(btn => {
      btn.onclick = async () => {
        const res = await apiFetch(`/api/storage-buckets/${btn.dataset.openBucket}/files`);
        const data = await res.json();
        const files = data.files || [];

        const html = files.length ? files.map(f => `
          <div class="list-card">
            <strong>${f.name || f.filename || 'File'}</strong><br>
            <span class="muted">Visibility: ${f.visibility || 'private'}</span>
            <div class="actions">
              <button class="ghost-btn" data-sign-file="${f.id}" type="button">Signed URL</button>
            </div>
          </div>
        `).join('') : '<div class="muted">No files in bucket.</div>';

        const wrap = document.createElement('section');
        wrap.className = 'card';
        wrap.innerHTML = `
          <div class="kicker">BUCKET FILES</div>
          <h2>${data.bucket?.name || 'Bucket'}</h2>
          ${html}
        `;
        content.appendChild(wrap);

        wrap.querySelectorAll('[data-sign-file]').forEach(b => {
          b.onclick = async () => {
            const res2 = await apiFetch(`/api/storage-buckets/files/${b.dataset.signFile}/sign`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ expiresInSeconds: 900 })
            });
            const out = await res2.json();
            if (out.signedUrl) {
              copyText(out.signedUrl, 'Signed URL copied');
            }
          };
        });
      };
    });

  } catch (error) {
    USGIOSAlert.show({ title: 'Storage Error', message: error.message, type: 'error' });
  }
}
loadBuckets();
