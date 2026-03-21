requireAuth();
USGShell.buildShell();

async function loadDomains() {
  const content = document.getElementById('page-content');

  USGPageKit.setPageHeader({
    kicker: 'DOMAIN',
    title: 'Domain Registry',
    subtitle: 'Manage domains and routing'
  });

  content.innerHTML += USGPageKit.searchToolbar({
    placeholder: 'Search domains...'
  });

  content.innerHTML += USGPageKit.loadingState();

  const res = await apiFetch('/api/domains');
  const data = await res.json();

  const list = (data.domains || []).map(d => `
    <div class="list-card">
      <strong>${d.name}</strong><br>
      <span class="muted">${d.publicAddress}</span><br>
      ${USGPageKit.statusBadge(d.status)}
      <div class="actions">
        ${USGPageKit.copyButton(d.publicAddress, 'Copy URL')}
        <a href="${d.publicAddress}" target="_blank" class="ghost-btn">Open</a>
      </div>
    </div>
  `).join('');

  content.innerHTML += list || USGPageKit.emptyState({ title: 'No Domains' });

  USGPageKit.wireCopyButtons();
  USGPageKit.attachBasicSearch({});
}

loadDomains();
