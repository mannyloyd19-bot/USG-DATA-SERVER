requireAuth();
USGShell.buildShell();

function loadSDK() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <div class="kicker">DEVELOPER SDK</div>
        <h2>Quick Start</h2>
        <div class="list-card">
          <strong>Base URL</strong>
          <pre class="code-block">${location.origin}</pre>
        </div>
        <div class="list-card">
          <strong>Auth Example</strong>
          <pre class="code-block">fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})</pre>
        </div>
      </section>

      <section class="card">
        <div class="kicker">USAGE EXAMPLES</div>
        <h2>Requests</h2>
        <div class="list-card">
          <strong>Get Collections</strong>
          <pre class="code-block">fetch('/api/collections', {
  headers: { Authorization: 'Bearer YOUR_TOKEN' }
})</pre>
        </div>
        <div class="list-card">
          <strong>Run Records Query</strong>
          <pre class="code-block">fetch('/api/collections/products/records?limit=10', {
  headers: { Authorization: 'Bearer YOUR_TOKEN' }
})</pre>
        </div>
      </section>
    </div>
  `;
  USGShell.setupRawToggles(content);
}
loadSDK();
