function renderLayout(title, content) {
  return `
    <div class="app">
      <aside class="sidebar">
        <h2>USG DATA</h2>
        <div class="nav">
          <a href="/">Dashboard</a>
          <a href="/pages/permissions-pro.html">Permissions</a>
          <a href="/pages/collections.html">Collections</a>
          <a href="/pages/relational.html">Relational</a>
          <a href="/pages/webhooks.html">Webhooks</a>
          <a href="/pages/realtime.html">Realtime</a>
        </div>
      </aside>

      <main>
        <div class="card">
          <h2>${title}</h2>
          ${content}
        </div>
      </main>
    </div>
  `;
}
