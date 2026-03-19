(function () {
  const NAV = [
    ['/index.html','🏠','Dashboard'],
    ['/pages/permissions-pro.html','🛡','Permissions'],
    ['/pages/users.html','👤','Users'],
    ['/pages/collections.html','📦','Collections'],
    ['/pages/fields.html','📄','Fields'],
    ['/pages/files.html','📁','Files'],
    ['/pages/api-keys.html','🔑','API Keys'],
    ['/pages/relational.html','🗂','Relational'],
    ['/pages/relationships.html','🔗','Relations'],
    ['/pages/webhooks.html','🪝','Webhooks'],
    ['/pages/realtime.html','📡','Realtime'],
    ['/pages/settings.html','⚙','Settings'],
    ['/pages/audit-logs.html','🧾','Audit Logs'],
    ['/pages/backups.html','💾','Backups'],
    ['/pages/sdk.html','🧩','SDK'],
    ['/pages/release.html','🚀','Release'],
    ['/pages/query-builder.html','📊','Query Builder'],
    ['/pages/enterprise-db.html','🗄','Enterprise DB']
  ];

  function getTheme() {
    return localStorage.getItem('usg_theme') || 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('usg_theme', theme);
    const btn = document.querySelector('[data-theme-btn]');
    if (btn) btn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  function logoutNow() {
    try {
      localStorage.removeItem('usg_token');
      localStorage.removeItem('usg_user');
      sessionStorage.clear();
    } catch {}
    location.replace('/login.html');
  }

  function buildShell() {
    const shell = document.getElementById('app-shell');
    if (!shell) return;

    const current = location.pathname === '/' ? '/index.html' : location.pathname;

    shell.innerHTML = `
      <aside class="sidebar">
        <div class="brand">
          <div class="logo">
            <img src="/assets/company-logo.png" alt="UNI-SOGOOD"
                 onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=&quot;color:#2f6fda;font-size:34px;font-weight:800&quot;>U</span>';">
          </div>
          <div>
            <div class="kicker">PRIVATE DATA PLATFORM</div>
            <div class="brand-title">UNI-SOGOOD<br>USG DATA SERVER</div>
          </div>
        </div>

        <nav class="nav">
          ${NAV.map(([href, icon, label]) => `
            <a href="${href}" class="${href === current ? 'active' : ''}">
              <span class="nav-icon">${icon}</span>
              <span>${label}</span>
            </a>
          `).join('')}
          <button type="button" id="logout-btn">
            <span class="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main class="main">
        <div class="topbar">
          <button class="theme-btn" type="button" data-theme-btn>Dark Mode</button>
          <div class="badges">
            <div class="badge"><span class="badge-dot"></span> System Online</div>
            <div class="badge"><span class="badge-dot"></span> Private Platform</div>
            <div class="badge"><span class="badge-dot"></span> Admin Mode</div>
          </div>
        </div>
        <div id="page-content"></div>
      </main>
    `;

    document.getElementById('logout-btn').addEventListener('click', logoutNow);
    const themeBtn = document.querySelector('[data-theme-btn]');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    setTheme(getTheme());
  }

  function setupRawToggles(scope = document) {
    scope.querySelectorAll('pre').forEach((pre, index) => {
      if (pre.dataset.rawHandled === 'true') return;
      pre.dataset.rawHandled = 'true';

      const wrap = document.createElement('div');
      const btn = document.createElement('button');
      btn.className = 'raw-toggle';
      btn.type = 'button';
      btn.textContent = 'Show Raw Data';

      pre.classList.add('raw-json');
      wrap.appendChild(btn);
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      btn.addEventListener('click', () => {
        const open = pre.classList.toggle('open');
        btn.textContent = open ? 'Hide Raw Data' : 'Show Raw Data';
      });
    });
  }

  window.USGShell = {
    buildShell,
    setupRawToggles,
    setTheme,
    getTheme
  };
})();
