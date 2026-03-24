window.__DISABLE_HEALTH_BANNER__ = window.__DISABLE_HEALTH_BANNER__ ?? false;

function requireAuth() {
  // keep your existing auth if meron
}

const USGShell = {
  buildShell() {
    const root = document.getElementById('app-shell');
    if (!root) return;

    root.innerHTML = `
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-title">USG DATA SERVER</div>
        </div>

        <nav class="grouped-nav">
          <!-- Sidebar content injected by sidebar-pro.js -->
        </nav>

        <div class="sidebar-footer">
          <div>usg-data-server · v1.0.0</div>
        </div>
      </aside>

      <main class="main">
        <div class="topbar"></div>
        <div id="page-content"></div>
      </main>
    `;
  }
};

function forceContentTop() {
  try {
    const main = document.querySelector('#app-shell .main');
    if (main) main.scrollTop = 0;

    const page = document.getElementById('page-content');
    if (page) page.scrollTop = 0;

    const topbar = document.querySelector('#app-shell .topbar');
    if (topbar) topbar.scrollIntoView({ block: 'start' });
  } catch {}
}

window.USGShell = USGShell;
window.forceContentTop = forceContentTop;
