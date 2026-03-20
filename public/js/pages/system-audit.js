requireAuth();
USGShell.buildShell();

async function loadSystemAudit() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">REVISION / HARDENING</div>
      <h1 style="margin:6px 0 0;font-size:32px">System Audit Center</h1>
      <div class="muted">Review platform readiness, critical files, pages, database tables, integrations, and git state before adding more features.</div>
      <div class="actions" style="margin-top:14px">
        <button class="primary-btn" type="button" id="refresh-audit">Refresh Audit</button>
      </div>
    </section>

    <div class="grid-3" style="margin-top:18px" id="audit-score-cards"></div>

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">FILES / PAGES</div>
        <h2>Critical Frontend + Backend Assets</h2>
        <div id="audit-files-box">Loading...</div>
      </section>

      <section class="card">
        <div class="kicker">DATABASE</div>
        <h2>Core Table Audit</h2>
        <div id="audit-db-box">Loading...</div>
      </section>
    </div>

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">INTEGRATIONS</div>
        <h2>DuckDNS / PM2 / Git</h2>
        <pre id="audit-integrations-box">Loading...</pre>
      </section>

      <section class="card">
        <div class="kicker">RAW REPORT</div>
        <h2>System Audit JSON</h2>
        <pre id="audit-raw-box">Loading...</pre>
      </section>
    </div>
  `;

  const scoreCards = document.getElementById('audit-score-cards');
  const filesBox = document.getElementById('audit-files-box');
  const dbBox = document.getElementById('audit-db-box');
  const integrationsBox = document.getElementById('audit-integrations-box');
  const rawBox = document.getElementById('audit-raw-box');

  async function refresh() {
    const res = await apiFetch('/api/system-audit/report');
    const data = await res.json();

    scoreCards.innerHTML = `
      <div class="info-card">
        <div class="info-title">Readiness</div>
        <div class="info-value">${data.readinessPercent || 0}%</div>
      </div>
      <div class="info-card">
        <div class="info-title">DB Found</div>
        <div class="info-value" style="font-size:18px">${data.database?.databaseFound ? 'YES' : 'NO'}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Git State</div>
        <div class="info-value" style="font-size:18px">${data.git?.dirty ? 'DIRTY' : 'CLEAN'}</div>
      </div>
    `;

    filesBox.innerHTML = `
      <div class="list-card">
        <strong>Critical files</strong>
        <div style="margin-top:10px">
          ${(data.files || []).map(item => `
            <div class="flag-row">
              <span>${item.file}</span>
              <span>${item.exists ? 'OK' : 'MISSING'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="list-card">
        <strong>Critical pages</strong>
        <div style="margin-top:10px">
          ${(data.pages || []).map(item => `
            <div class="flag-row">
              <span>${item.file}</span>
              <span>${item.exists ? 'OK' : 'MISSING'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    dbBox.innerHTML = `
      <div class="list-card">
        <strong>Database path</strong><br>
        <span class="muted">${data.database?.dbPath || '-'}</span>
      </div>
      <div class="list-card">
        <strong>Expected core tables</strong>
        <div style="margin-top:10px">
          ${(data.expectedTables || []).map(item => `
            <div class="flag-row">
              <span>${item.table}</span>
              <span>${item.exists ? 'OK' : 'MISSING'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    integrationsBox.textContent = JSON.stringify({
      integrations: data.integrations,
      git: data.git
    }, null, 2);

    rawBox.textContent = JSON.stringify(data, null, 2);

    USGShell.setupRawToggles(content);
  }

  document.getElementById('refresh-audit').addEventListener('click', refresh);
  await refresh();
}

loadSystemAudit();
