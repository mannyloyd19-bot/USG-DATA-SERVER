window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

async function loadFields() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATABASE',
    title: 'Fields',
    subtitle: 'View and manage collection field definitions'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Field Controls</h2>
      </div>
      <div class="actions">
        <a href="/pages/collections.html" class="ghost-btn">Open Collections</a>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  const infoWrap = document.createElement('section');
  infoWrap.className = 'card';
  infoWrap.style.marginTop = '18px';
  infoWrap.innerHTML = `
    <div class="kicker">FIELD MANAGEMENT</div>
    <h2>Collection-based Fields</h2>
    <div class="muted">
      Field definitions are managed inside a selected collection context.
      Open Collections first, then manage schema fields from the target collection workflow.
    </div>
    <div class="actions" style="margin-top:14px">
      <a href="/pages/collections.html" class="primary-btn">Go to Collections</a>
    </div>
  `;
  content.appendChild(infoWrap);
}
loadFields();
