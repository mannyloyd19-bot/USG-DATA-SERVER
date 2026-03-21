requireAuth();
USGShell.buildShell();

async function loadFields() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATABASE',
    title: 'Fields',
    subtitle: 'View collection field definitions'
  });

  content.innerHTML += `
    <section class="card" style="margin-top:18px">
      <div class="muted">Open a collection-specific fields route to manage field definitions.</div>
    </section>
  `;
}
loadFields();
