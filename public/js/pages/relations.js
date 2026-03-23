window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function card(title, desc, href) {
  return `
    <div class="list-card">
      <strong>${title}</strong><br>
      <span class="muted">${desc}</span>
      <div class="actions">
        <a class="primary-btn" href="${href}">Open</a>
      </div>
    </div>
  `;
}

async function loadRelationsHub() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'RELATIONS',
    title: 'Relationships Console',
    subtitle: 'Open the strongest relationship tools from one consolidated place'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">TOOLS</div>
      <h2>Relationship Modules</h2>
      ${card('Relationships', 'Primary relationship CRUD and management console.', '/pages/relationships.html')}
      ${card('Relational', 'Table, column, and row level relational data tools.', '/pages/relational.html')}
      ${card('Collections', 'Manage source and target collections before linking.', '/pages/collections.html')}
    </section>
  `;
}
loadRelationsHub();
