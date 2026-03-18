requireAuth();

const fileListEl = document.getElementById('file-list');
const fileFormEl = document.getElementById('file-form');

async function loadFiles() {
  fileListEl.innerHTML = '<div class="muted">Loading files...</div>';

  try {
    const res = await apiFetch('/api/files');
    const files = await res.json();

    if (!Array.isArray(files) || files.length === 0) {
      fileListEl.innerHTML = '<div class="muted">No files uploaded yet.</div>';
      return;
    }

    fileListEl.innerHTML = files.map(file => `
      <div class="item-card">
        <div><strong>${file.originalName}</strong></div>
        <div class="muted">${file.mimeType || 'unknown'} · ${file.size || 0} bytes</div>
        <div class="muted">${file.collectionKey || 'no collection'}</div>
        <div style="margin-top:10px">
          <a class="mini-btn" href="/api/files/${file.id}/download">Download</a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    fileListEl.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

fileFormEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  const fileInput = document.getElementById('upload-file');
  const collectionKey = document.getElementById('upload-collection').value.trim();

  if (!fileInput.files.length) {
    alert('Select a file first');
    return;
  }

  formData.append('file', fileInput.files[0]);
  if (collectionKey) formData.append('collectionKey', collectionKey);

  try {
    const res = await fetch('/api/files/upload', {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to upload file');

    fileFormEl.reset();
    loadFiles();
  } catch (error) {
    alert(error.message);
  }
});

loadFiles();
