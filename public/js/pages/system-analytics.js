requireAuth();
USGShell.buildShell();

async function loadAnalytics() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'SYSTEM',
    title: 'System Analytics',
    subtitle: 'Server usage and performance'
  });

  content.innerHTML += USGPageKit.loadingState();

  const res = await apiFetch('/api/system');
  const data = await res.json();

  content.innerHTML += `
    <div class="grid-3">
      ${USGPageKit.infoCard('CPU', data.cpu || 'N/A')}
      ${USGPageKit.infoCard('Memory', data.memory || 'N/A')}
      ${USGPageKit.infoCard('Uptime', data.uptime || 'N/A')}
    </div>
  `;
}

loadAnalytics();
