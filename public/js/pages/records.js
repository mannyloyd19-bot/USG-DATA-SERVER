requireAuth();
USGShell.buildShell();

async function loadRecords() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DATA',
    title: 'Records',
    subtitle: 'Collection records management entry point'
  });

  content.innerHTML += `
    <section class="card" style="margin-top:18px">
      <div class="muted">Select a collection first to view or manage records.</div>
    </section>
  `;
}
loadRecords();
