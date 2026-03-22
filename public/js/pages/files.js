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
        <button id="refresh-files-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  document.getElementById('refresh-files-btn').onclick = () => loadFiles();

  const searchWrap = document.createElement('div');
  searchWrap.innerHTML = USGPageKit.searchToolbar({ placeholder: 'Search files...' });
  content.appendChild(searchWrap);

  try {
    const res = await apiFetch('/api/files');
    const data = await res.json();
    const rows = data.files || data.data || [];

    const listWrap = document.createElement('section');
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = rows.length ? rows.map(f => `
      <div class="list-card">
        <strong>${f.name || f.filename || 'File'}</strong><br>
        <span class="muted">Type: ${f.mimeType || f.type || '-'}</span><br>
        <span class="muted">Size: ${f.size || 0}</span>
        <div class="actions">
          ${f.url ? `<button class="ghost-btn" data-copy-file="${f.url}" type="button">Copy Link</button>` : ''}
          ${f.url ? `<a href="${f.url}" target="_blank" class="ghost-btn">Open</a>` : ''}
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No files found' });

    content.appendChild(listWrap);
    USGPageKit.attachBasicSearch({});

    document.querySelectorAll('[data-copy-file]').forEach(btn => {
      btn.onclick = () => copyText(btn.dataset.copyFile, 'File link copied');
    });
  } catch (err) {
    USGIOSAlert.show({ title: 'Files Error', message: err.message, type: 'error' });
  }
}
loadFiles();
