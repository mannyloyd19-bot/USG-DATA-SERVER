requireAuth();
USGShell.buildShell();

async function loadFiles() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'STORAGE',
    title: 'Files',
    subtitle: 'Manage uploaded files'
  });

  content.innerHTML += USGPageKit.loadingState();

  const res = await apiFetch('/api/files');
  const data = await res.json();

  content.innerHTML += (data.files || []).map(f => `
    <div class="list-card">
      <strong>${f.name}</strong><br>
      <span class="muted">${f.size || 0} bytes</span>
      <div class="actions">
        ${USGPageKit.copyButton(f.url)}
      </div>
    </div>
  `).join('');

  USGPageKit.wireCopyButtons();
}

loadFiles();
