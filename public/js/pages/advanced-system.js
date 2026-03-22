requireAuth();
USGShell.buildShell();

async function safeJson(url) {
  try {
    const res = await apiFetch(url);
    return await res.json();
  } catch {
    return {};
  }
}

function metricCard(title, value, subtitle = '') {
  return `
    <section class="card">
      <div class="kicker">${title.toUpperCase()}</div>
      <h2 style="margin:8px 0 6px">${value}</h2>
      <div class="muted">${subtitle}</div>
    </section>
  `;
}

async function loadAdvancedSystem() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'ADVANCED',
    title: 'Advanced System Layer',
    subtitle: 'Usage tracking, job queue, tenant isolation, and rate limiting'
  });

  const [overviewData, usageData, jobsData] = await Promise.all([
    safeJson('/api/advanced-system/overview'),
    safeJson('/api/usage-tracking/summary'),
    safeJson('/api/job-queue')
  ]);

  const overview = overviewData.overview || {};
  const jobs = jobsData.jobs || [];
  const topRoutes = usageData.topRoutes || [];
  const topDomains = usageData.topDomains || [];

  content.innerHTML = `
    <div class="grid-4" style="margin-top:18px">
      ${metricCard('Usage Events', overview.usageCount || 0, 'Tracked requests')}
      ${metricCard('Pending Jobs', overview.pendingJobs || 0, 'Awaiting execution')}
      ${metricCard('Failed Jobs', overview.failedJobs || 0, 'Need review')}
      ${metricCard('Completed Jobs', overview.completedJobs || 0, 'Processed tasks')}
    </div>

    <div class="grid-3" style="margin-top:18px">
      <section class="card">
        <div class="kicker">PROTECTION</div>
        <h2>Guards</h2>
        <div class="muted">
          Rate Limiting: ${overview.rateLimiting ? 'Enabled' : 'Disabled'}<br>
          Tenant Isolation: ${overview.tenantIsolation ? 'Enabled' : 'Disabled'}<br>
          Job Queue: ${overview.jobQueue ? 'Enabled' : 'Disabled'}
        </div>
      </section>

      <section class="card">
        <div class="kicker">TOP ROUTES</div>
        <h2>Usage Routes</h2>
        ${
          topRoutes.length
            ? topRoutes.map(r => `<div class="list-card"><strong>${r.route || '-'}</strong><br><span class="muted">Count: ${r.count || 0}</span></div>`).join('')
            : '<div class="muted">No route data yet.</div>'
        }
      </section>

      <section class="card">
        <div class="kicker">TOP DOMAINS</div>
        <h2>Usage by Domain</h2>
        ${
          topDomains.length
            ? topDomains.map(d => `<div class="list-card"><strong>${d.domainId || 'unknown'}</strong><br><span class="muted">Count: ${d.count || 0}</span></div>`).join('')
            : '<div class="muted">No domain data yet.</div>'
        }
      </section>
    </div>

    <section class="card" style="margin-top:18px">
      <div class="kicker">JOB QUEUE</div>
      <h2>Queued Jobs</h2>
      ${
        jobs.length
          ? jobs.map(job => `<div class="list-card"><strong>${job.jobType}</strong><br><span class="muted">Status: ${job.status}</span><br><span class="muted">${job.createdAt || ''}</span></div>`).join('')
          : '<div class="muted">No jobs in queue.</div>'
      }
    </section>
  `;
}

loadAdvancedSystem();
