requireAuth();
USGShell.buildShell();

async function loadRecords() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATA',
    title: 'Records',
    subtitle: 'Record access and collection data management'
  });

  const actionsCard = document.createElement('section');
  actionsCard.className = 'card';
  actionsCard.style.marginTop = '18px';
  actionsCard.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2 style="margin:8px 0 0">Record Controls</h2>
      </div>
      <div class="actions">
        <a href="/pages/collections.html" class="ghost-btn">Select Collection</a>
      </div>
    </div>
  `;
  content.appendChild(actionsCard);

  const infoWrap = document.createElement('section');
  infoWrap.className = 'card';
  infoWrap.style.marginTop = '18px';
  infoWrap.innerHTML = `
    <div class="kicker">RECORD ACCESS</div>
    <h2>Collection-first Record Workflow</h2>
    <div class="muted">
      Record management is tied to a collection route.
      Choose a collection first, then open its records workflow for create, edit, search, and delete operations.
    </div>
    <div class="actions" style="margin-top:14px">
      <a href="/pages/collections.html" class="primary-btn">Open Collections</a>
    </div>
  `;
  content.appendChild(infoWrap);
}
loadRecords();
