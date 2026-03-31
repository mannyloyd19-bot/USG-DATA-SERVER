requireAuth();
USGShell.buildShell();

async function copyText(value, title = 'Copied') {
  try {
    await navigator.clipboard.writeText(value || '');
    USGEnhancedUI?.success('Copied', title) || USGIOSAlert.show({ title: 'Copied', message: title });
  } catch {
    USGEnhancedUI?.error('Copy Failed', title) || USGIOSAlert.show({ title: 'Copy Failed', message: title, type: 'error' });
  }
}

async function uploadTempFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = async () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    try {
      const token = localStorage.getItem('usg_token') || '';
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: form
      });

      const out = await res.json();
      if (!res.ok) {
        throw new Error(out.message || 'Upload failed');
      }

      USGEnhancedUI?.success('File Uploaded', out.file?.originalName || 'Upload successful');
      loadFiles();
    } catch (err) {
      USGEnhancedUI?.error('Upload Failed', err.message);
    }
  };
  input.click();
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
        <button id="upload-file-btn" class="primary-btn" type="button">Upload File</button>
        <button id="refresh-files-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-files-btn').onclick = () => loadFiles();
  document.getElementById('upload-file-btn').onclick = () => uploadTempFile();

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search files...' });
  content.appendChild(searchWrap);

  const listWrap = document.createElement('section');
  listWrap.style.marginTop = '18px';
  listWrap.innerHTML = window.USGEnhancedUI
    ? window.USGEnhancedUI.loadingCard('Loading files...')
    : '<div class="muted">Loading files...</div>';
  content.appendChild(listWrap);

  try {
    const res = await apiFetch('/api/files');
    const data = await res.json();
    const rows = data.files || data.data || [];

    listWrap.innerHTML = rows.length ? rows.map(f => `
      <div class="list-card">
        <strong>${f.name || f.filename || 'File'}</strong><br>
        <span class="muted">Type: ${f.mimeType || f.type || '-'}</span><br>
        <span class="muted">Size: ${f.size || 0}</span>
        <div class="actions">
          ${f.previewUrl ? `<a href="${f.previewUrl}" target="_blank" class="ghost-btn">Preview</a>` : ''}
          ${f.url ? `<a href="${f.url}" target="_blank" class="ghost-btn">Download</a>` : ''}
          ${f.url ? `<button class="ghost-btn" data-copy-file="${f.url}" type="button">Copy Link</button>` : ''}
          <button class="danger-btn" data-delete-file="${f.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : (window.USGEnhancedUI
      ? window.USGEnhancedUI.emptyCard('No files found', 'Upload a file to get started.')
      : USGPageKit.emptyState({ title: 'No files found' }));

    USGPageKit.attachBasicSearch({});

    document.querySelectorAll('[data-copy-file]').forEach(btn => {
      btn.onclick = () => copyText(btn.dataset.copyFile, 'File link copied');
    });

    document.querySelectorAll('[data-delete-file]').forEach(btn => {
      btn.onclick = async () => {
        if (!(window.USGEnhancedUI?.confirmAction('Delete this file?') ?? confirm('Delete this file?'))) return;
        try {
          const r = await apiFetch(`/api/files/${btn.dataset.deleteFile}`, { method: 'DELETE' });
          const out = await r.json();
          if (!r.ok) throw new Error(out.message || 'Delete failed');
          USGEnhancedUI?.success('File Deleted', out.message || 'File deleted successfully');
          loadFiles();
        } catch (err) {
          USGEnhancedUI?.error('Delete Failed', err.message);
        }
      };
    });
  } catch (err) {
    listWrap.innerHTML = `<section class="card"><div class="muted">Files Error: ${err.message}</div></section>`;
  }
}
loadFiles();
