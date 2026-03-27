requireAuth();
USGShell.buildShell();

async function copyText(value, title = 'Copied') {
  try {
    await navigator.clipboard.writeText(value || '');
    USGIOSAlert.show({ title: 'Copied', message: title });
  } catch {
    USGIOSAlert.show({ title: 'Copy Failed', message: title, type: 'error' });
  }
}

async function uploadFile(formData) {
  const token = localStorage.getItem('token') || '';
  const res = await fetch('/api/files', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });

  if (!res.ok) {
    const out = await res.json().catch(() => ({}));
    throw new Error(out.message || 'Upload failed');
  }

  return res.json();
}

async function loadFiles() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'FILES',
    title: 'Files',
    subtitle: 'Manage uploaded files and stored assets'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">File Controls</h2>
      </div>
      <div class="actions">
        <input id="file-upload-input" type="file" style="display:none">
        <button id="upload-file-btn" class="primary-btn" type="button">+ Upload File</button>
        <button id="refresh-files-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-files-btn').onclick = () => loadFiles();

  const fileInput = document.getElementById('file-upload-input');
  document.getElementById('upload-file-btn').onclick = () => fileInput.click();

  fileInput.onchange = async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadFile(formData);
      USGIOSAlert.show({ title: 'Upload Complete', message: file.name });
      loadFiles();
    } catch (err) {
      USGIOSAlert.show({ title: 'Upload Failed', message: err.message, type: 'error' });
    } finally {
      fileInput.value = '';
    }
  };

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search files...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/files');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.files || data.data || []);

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(f => `
      <div class="list-card">
        <strong>${f.name || f.filename || 'File'}</strong><br>
        <span class="muted">Type: ${f.mimeType || f.type || '-'}</span><br>
        <span class="muted">Size: ${f.size || 0}</span>
        <div class="actions">
          ${f.url ? `<button class="ghost-btn" data-copy-file="${f.url}" type="button">Copy Link</button>` : ''}
          ${f.previewUrl ? `<a href="${f.previewUrl}" target="_blank" class="ghost-btn">Preview</a>` : ''}
          ${f.url ? `<a href="${f.url}" target="_blank" class="ghost-btn">Download</a>` : ''}
          <button class="danger-btn" data-delete-file="${f.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No files found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});

    document.querySelectorAll('[data-copy-file]').forEach(btn => {
      btn.onclick = () => copyText(btn.dataset.copyFile, 'File link copied');
    });

    document.querySelectorAll('[data-delete-file]').forEach(btn => {
      btn.onclick = () => USGCrudKit.remove({
        title: 'Delete File',
        message: 'Delete this file?',
        endpoint: `/api/files/${btn.dataset.deleteFile}`,
        onDone: () => loadFiles()
      });
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'Files Error', message: err.message, type: 'error' });
  }
}
loadFiles();
