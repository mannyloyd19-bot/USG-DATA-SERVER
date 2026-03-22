window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function metricCard(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title.toUpperCase()}</div>
      <h2>${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

function deploymentCard(item) {
  return `
    <div class="list-card">
      <strong>${item.name || item.id || 'Deployment'}</strong><br>
      <span class="muted">Status: ${item.status || '-'}</span><br>
      <span class="muted">Created: ${item.createdAt || ''}</span><br>
      <span class="muted">Updated: ${item.updatedAt || ''}</span>
      <div class="actions">
        ${USGPageKit.statusBadge(item.status || 'unknown')}
        <button class="ghost-btn" data-mark-success="${item.id}" type="button">Mark Success</button>
        <button class="danger-btn" data-mark-failed="${item.id}" type="button">Mark Failed</button>
      </div>
    </div>
  `;
}

async function loadDeploymentDiagnostics() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DEPLOYMENTS',
    title: 'Deployment Diagnostics',
    subtitle: 'Inspect deployment status, recent deployment history, and app deployment health'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Deployment Controls</h2>
      </div>
      <div class="actions">
        <button id="refresh-deployment-diagnostics-btn" class="primary-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-deployment-diagnostics-btn').onclick = () => loadDeploymentDiagnostics();

  try {
    const [summaryRes, listRes] = await Promise.all([
      apiFetch('/api/deployment-diagnostics/summary'),
      apiFetch('/api/deployment-diagnostics/deployments')
    ]);

    const summaryData = await summaryRes.json();
    const listData = await listRes.json();

    const summary = summaryData.summary || {};
    const latest = summaryData.latest || {};
    const deployments = listData.deployments || [];

    content.innerHTML += `
      <div class="grid-4">
        ${metricCard('Total', summary.totalDeployments || 0, 'All deployments')}
        ${metricCard('Running Apps', summary.runningApps || 0, 'Active applications')}
        ${metricCard('Stopped Apps', summary.stoppedApps || 0, 'Stopped applications')}
        ${metricCard('Failed', summary.failedDeployments || 0, 'Failed deployments')}
      </div>
    `;

    const latestWrap = document.createElement('section');
    latestWrap.className = 'card';
    latestWrap.style.marginTop = '18px';
    latestWrap.innerHTML = `
      <div class="kicker">LATEST DEPLOYMENT</div>
      <h2>Latest Status</h2>
      <div class="muted">
        ID: ${latest.id || '-'}<br>
        Status: ${latest.status || '-'}<br>
        Created: ${latest.createdAt || '-'}<br>
        Updated: ${latest.updatedAt || '-'}
      </div>
    `;
    content.appendChild(latestWrap);

    const listWrap = document.createElement('section');
    listWrap.className = 'card';
    listWrap.style.marginTop = '18px';
    listWrap.innerHTML = `
      <div class="kicker">DEPLOYMENT HISTORY</div>
      <h2>Recent Deployments</h2>
      ${deployments.length ? deployments.map(deploymentCard).join('') : '<div class="muted">No deployments found.</div>'}
    `;
    content.appendChild(listWrap);

    deployments.forEach(item => {
      const successBtn = document.querySelector(`[data-mark-success="${item.id}"]`);
      if (successBtn) {
        successBtn.onclick = async () => {
          await apiFetch(`/api/deployment-diagnostics/deployments/${item.id}/mark-success`, { method: 'POST' });
          loadDeploymentDiagnostics();
        };
      }

      const failedBtn = document.querySelector(`[data-mark-failed="${item.id}"]`);
      if (failedBtn) {
        failedBtn.onclick = async () => {
          await apiFetch(`/api/deployment-diagnostics/deployments/${item.id}/mark-failed`, { method: 'POST' });
          loadDeploymentDiagnostics();
        };
      }
    });
  } catch (error) {
    USGIOSAlert.show({ title: 'Deployment Diagnostics Error', message: error.message, type: 'error' });
  }
}

loadDeploymentDiagnostics();
