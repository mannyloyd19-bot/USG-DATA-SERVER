window.__DISABLE_HEALTH_BANNER__ = window.__DISABLE_HEALTH_BANNER__ ?? false;

function requireAuth() {}

const USGShell = {
  buildShell() {
    const root = document.getElementById('app-shell');
    if (!root) return;

    root.classList.add('shell');

    root.innerHTML = `
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-title">USG DATA SERVER</div>
        </div>

        <nav class="grouped-nav" id="sidebar-nav"></nav>

        <div class="sidebar-footer">
          <div>usg-data-server · v1.0.0</div>
        </div>
      </aside>

      <main class="main">
        <div class="topbar" data-top-actions></div>
        <div id="page-content"></div>
      </main>
    `;

    // 🔥 IMPORTANT: re-init sidebar builder
    if (window.buildSidebarNav) {
      window.buildSidebarNav(document.getElementById('sidebar-nav'));
    }
  }
};

function forceContentTop() {
  const main = document.querySelector('#app-shell .main');
  if (main) main.scrollTop = 0;
}

window.USGShell = USGShell;
window.forceContentTop = forceContentTop;
