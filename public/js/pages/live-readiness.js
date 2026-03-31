requireAuth();
USGShell.buildShell();

async function loadLiveReadiness() {
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <section class="hero card">
      <div class="kicker">LIVE APP READINESS</div>
      <h1 style="margin:6px 0 0;font-size:32px">Install / PC / Tablet Readiness</h1>
      <div class="muted">Checks if NexaCore is ready to run as an always-on PC server with browser dashboard access.</div>
      <div class="actions" style="margin-top:14px">
        <button class="primary-btn" id="refresh-readiness">Refresh Status</button>
      </div>
    </section>

    <div class="grid-3" style="margin-top:18px" id="top-cards"></div>

    <div class="grid-2" style="margin-top:24px">
      <section class="card">
        <div class="kicker">CHECKLIST</div>
        <h2>Core Readiness Checks</h2>
        <div id="checks-box">Loading...</div>
      </section>

      <section class="card">
        <div class="kicker">SYSTEM INFO</div>
        <h2>Runtime Environment</h2>
        <pre id="system-box">Loading...</pre>
      </section>
    </div>
  `;

  const topCards = document.getElementById('top-cards');
  const checksBox = document.getElementById('checks-box');
  const systemBox = document.getElementById('system-box');

  async function refresh() {
    const res = await apiFetch('/api/live-readiness/status');
    const data = await res.json();

    if (!res.ok) {
      USGIOSAlert.show({
        title: 'Live Readiness Error',
        message: data.message || 'Failed to load readiness status',
        type: 'error'
      });
      return;
    }

    topCards.innerHTML = `
      <div class="info-card">
        <div class="info-title">Readiness</div>
        <div class="info-value">${data.readinessPercent || 0}%</div>
      </div>
      <div class="info-card">
        <div class="info-title">Environment</div>
        <div class="info-value" style="font-size:18px">${data.system?.env || 'unknown'}</div>
      </div>
      <div class="info-card">
        <div class="info-title">Platform</div>
        <div class="info-value" style="font-size:18px">${data.system?.platform || 'unknown'}</div>
      </div>
    `;

    checksBox.innerHTML = Object.entries(data.checks || {}).map(([key, value]) => `
      <div class="flag-row">
        <strong>${key}</strong>
        <span>${value ? 'READY' : 'MISSING'}</span>
      </div>
    `).join('');

    systemBox.textContent = JSON.stringify(data.system || {}, null, 2);
    USGShell.setupRawToggles(content);
  }

  document.getElementById('refresh-readiness').addEventListener('click', refresh);
  await refresh();
}

loadLiveReadiness();
