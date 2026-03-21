requireAuth();
USGShell.buildShell();

function parseFields(v) {
  return String(v || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
}

async function loadIndexManager() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">INDEX MANAGER</div>
      <h1 style="margin:6px 0 0;font-size:32px">Collection Index Registry</h1>
      <div class="muted">Track collection indexes, define index fields, mark unique indexes, and manage database optimization metadata.</div>
    </section>

    <div class="grid-2" style="margin-top:18px">
      <section class="card">
        <div class="kicker">CREATE INDEX</div>
        <h2>Index Definition</h2>
        <form id="index-form">
          <input id="collectionKey" placeholder="Collection key" required>
          <input id="indexName" placeholder="Index name" required>
          <input id="fields" placeholder="Fields, comma-separated">
          <div class="row-top">
            <select id="uniqueIndex">
              <option value="false">Normal index</option>
              <option value="true">Unique index</option>
            </select>
            <select id="status">
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
          </div>
          <textarea id="notes" rows="4" placeholder="Notes"></textarea>
          <div class="actions">
            <button class="primary-btn" type="submit">Save Index</button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="kicker">RAW OUTPUT</div>
        <h2>Last Result</h2>
        <pre id="index-output">No action yet.</pre>
      </section>
    </div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">INDEX REGISTRY</div>
      <h2>All Indexes</h2>
      <div id="index-list">Loading...</div>
    </section>
  `;

  const form = document.getElementById('index-form');
  const list = document.getElementById('index-list');
  const output = document.getElementById('index-output');

  async function refresh() {
    const res = await apiFetch('/api/indexes');
    const data = await res.json();
    const rows = Array.isArray(data.indexes) ? data.indexes : [];

    list.innerHTML = rows.map(item => `
      <div class="list-card">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <strong>${item.indexName}</strong><br>
            <span class="muted">collection: ${item.collectionKey}</span><br>
            <span class="muted">fields: ${(item.fields || []).join(', ') || '-'}</span><br>
            <span class="muted">unique: ${item.uniqueIndex ? 'yes' : 'no'} · status: ${item.status}</span><br>
            <span class="muted">${item.notes || ''}</span>
          </div>
          <div class="badge ${item.status === 'active' ? 'ok' : 'warn'}">
            <span class="badge-dot"></span>${item.status}
          </div>
        </div>
        <div class="actions">
          <button class="ghost-btn" type="button" data-toggle="${item.id}" data-state="${item.status}">${item.status === 'active' ? 'Disable' : 'Enable'}</button>
          <button class="danger-btn" type="button" data-delete="${item.id}">Delete</button>
        </div>
      </div>
    `).join('') || '<div class="muted">No indexes found.</div>';

    document.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-toggle');
        const state = btn.getAttribute('data-state');
        const res = await apiFetch(`/api/indexes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: state === 'active' ? 'disabled' : 'active' })
        });
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);
        await refresh();
        USGShell.setupRawToggles(content);
      });
    });

    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete');
        if (!confirm('Delete this index?')) return;
        const res = await apiFetch(`/api/indexes/${id}`, { method: 'DELETE' });
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);
        await refresh();
        USGShell.setupRawToggles(content);
      });
    });

    USGShell.setupRawToggles(content);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      collectionKey: document.getElementById('collectionKey').value.trim(),
      indexName: document.getElementById('indexName').value.trim(),
      fields: parseFields(document.getElementById('fields').value),
      uniqueIndex: document.getElementById('uniqueIndex').value === 'true',
      status: document.getElementById('status').value,
      notes: document.getElementById('notes').value.trim()
    };

    const res = await apiFetch('/api/indexes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
    form.reset();
    await refresh();
    USGShell.setupRawToggles(content);
  });

  await refresh();
}

loadIndexManager();
