requireAuth();
USGShell.buildShell();

function humanBytes(v) {
  const n = Number(v || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function loadCollectionStats() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">COLLECTION STATS</div>
      <h1 style="margin:6px 0 0;font-size:32px">Database Overview</h1>
      <div class="muted">Review collection counts, approximate storage footprint, and file inventory stats for the private data platform.</div>
      <div class="actions" style="margin-top:14px">
        <button class="primary-btn" type="button" id="refresh-stats">Refresh Stats</button>
      </div>
    </section>

    <div class="grid-3" style="margin-top:18px" id="stats-top-cards"></div>

    <section class="card" style="margin-top:24px">
      <div class="kicker">COLLECTION BREAKDOWN</div>
      <h2>All Collections</h2>
      <div id="collection-stats-list">Loading...</div>
    </section>

    <section class="card" style="margin-top:24px">
      <div class="kicker">RAW OUTPUT</div>
      <h2>Stats JSON</h2>
      <pre id="collection-stats-raw">Loading...</pre>
    </section>
  `;

  const topCards = document.getElementById('stats-top-cards');
  const list = document.getElementById('collection-stats-list');
  const raw = document.getElementById('collection-stats-raw');

  async function refresh() {
    const res = await apiFetch('/api/collection-stats/summary');
    const data = await res.json();

    const rows = Array.isArray(data.collections) ? data.collections : [];
    const totalCollections = rows.length;
    const totalRecords = rows.reduce((sum, x) => sum + Number(x.recordCount || 0), 0);
    const totalApproxBytes = rows.reduce((sum, x) => sum + Number(x.approxBytes || 0), 0);

    topCards.innerHTML = `
      <div class="info-card">
        <div class="info-title">Collections</div>
        <div class="info-value">${totalCollections}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Records</div>
        <div class="info-value">${totalRecords}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Approx Data</div>
        <div class="info-value" style="font-size:22px">${humanBytes(totalApproxBytes)}</div>
      </div>
    `;

    list.innerHTML = rows.map(item => `
      <div class="list-card">
        <strong>${item.name}</strong><br>
        <span class="muted">collection key: ${item.collectionKey}</span><br>
        <span class="muted">table: ${item.tableName || '-'}</span><br>
        <span class="muted">records: ${item.recordCount}</span><br>
        <span class="muted">approx size: ${humanBytes(item.approxBytes)}</span>
      </div>
    `).join('') + `
      <div class="list-card">
        <strong>Files Inventory</strong><br>
        <span class="muted">files count: ${data.files?.count || 0}</span><br>
        <span class="muted">files bytes: ${humanBytes(data.files?.bytes || 0)}</span>
      </div>
    `;

    raw.textContent = JSON.stringify(data, null, 2);
    USGShell.setupRawToggles(content);
  }

  document.getElementById('refresh-stats').addEventListener('click', refresh);
  await refresh();
}

loadCollectionStats();
