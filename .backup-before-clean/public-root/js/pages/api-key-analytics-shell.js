requireAuth();
USGShell.buildShell();

function formatNumber(v){ return Number(v||0).toLocaleString(); }

function groupBy(arr, keyFn){
  const map = {};
  for(const item of arr){
    const key = keyFn(item) || 'unknown';
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

function sortEntries(obj){
  return Object.entries(obj).sort((a,b)=>b[1]-a[1]);
}

async function loadApiKeyAnalytics(){
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <section class="card">
      <div class="kicker">API ANALYTICS PRO</div>
      <h2>System Insights</h2>
      <div class="grid-4" id="stats"></div>
    </section>

    <div class="grid-2">
      <section class="card">
        <h3>Top IP Addresses</h3>
        <div id="top-ips">Loading...</div>
      </section>

      <section class="card">
        <h3>Status Breakdown</h3>
        <div id="status-breakdown">Loading...</div>
      </section>
    </div>

    <section class="card">
      <h3>Failed Requests (4xx/5xx)</h3>
      <div id="failed-logs">Loading...</div>
    </section>
  `;

  const logsRes = await apiFetch('/api/api-key-logs');
  const logs = await logsRes.json();

  const rows = Array.isArray(logs) ? logs : [];

  const total = rows.length;
  const success = rows.filter(r=>r.statusCode>=200 && r.statusCode<300).length;
  const clientErr = rows.filter(r=>r.statusCode>=400 && r.statusCode<500).length;
  const serverErr = rows.filter(r=>r.statusCode>=500).length;

  document.getElementById('stats').innerHTML = `
    <div class="info-card"><div>Total</div><strong>${formatNumber(total)}</strong></div>
    <div class="info-card"><div>Success</div><strong>${formatNumber(success)}</strong></div>
    <div class="info-card"><div>4xx</div><strong>${formatNumber(clientErr)}</strong></div>
    <div class="info-card"><div>5xx</div><strong>${formatNumber(serverErr)}</strong></div>
  `;

  // Top IPs
  const ipMap = groupBy(rows, r=>r.ipAddress);
  const topIps = sortEntries(ipMap).slice(0,10);

  document.getElementById('top-ips').innerHTML =
    topIps.map(([ip,count])=>`
      <div class="list-card">
        <strong>${ip || 'unknown'}</strong>
        <div class="muted">${count} requests</div>
      </div>
    `).join('') || '<div class="muted">No data</div>';

  // Status breakdown
  const statusMap = groupBy(rows, r=>r.statusCode);
  const statuses = sortEntries(statusMap);

  document.getElementById('status-breakdown').innerHTML =
    statuses.map(([code,count])=>`
      <div class="list-card">
        <strong>${code}</strong>
        <div class="muted">${count} requests</div>
      </div>
    `).join('');

  // Failed logs
  const failed = rows.filter(r=>r.statusCode>=400).slice(0,20);

  document.getElementById('failed-logs').innerHTML =
    failed.map(item=>`
      <div class="list-card">
        <strong>${item.apiKeyName || 'Unknown'}</strong>
        <div class="muted">${item.method} ${item.path}</div>
        <div class="muted">status: ${item.statusCode} · ip: ${item.ipAddress}</div>
      </div>
    `).join('') || '<div class="muted">No failed requests</div>';
}

loadApiKeyAnalytics();
