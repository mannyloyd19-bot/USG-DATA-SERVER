requireAuth();
USGShell.buildShell();

async function initQB() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2-wide">
      <section class="card">
        <div class="kicker">VISUAL QUERY</div>
        <h2>Query Builder</h2>
        <div class="muted">Clean rebuild shell active.</div>
      </section>

      <section class="card">
        <div class="kicker">PREVIEW</div>
        <h2>Generated Query</h2>
        <pre id="qb-preview">Query Builder shell restored.</pre>
      </section>
    </div>
  `;
  USGShell.setupRawToggles(content);
}

initQB();
