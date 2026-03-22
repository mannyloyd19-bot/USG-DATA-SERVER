try {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
} catch {}

window.addEventListener('load', () => {
  try {
    window.scrollTo(0, 0);
  } catch {}
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
    try {
      sessionStorage.setItem('usg_reset_scroll', '1');
    } catch {}
  }
});

try {
  if (sessionStorage.getItem('usg_reset_scroll') === '1') {
    sessionStorage.removeItem('usg_reset_scroll');
    setTimeout(() => {
      try {
        window.scrollTo(0, 0);
      } catch {}
    }, 0);
  }
} catch {}

(function () {
  const NAV = [
    ['/index.html','🏠','Dashboard'],
    ['/pages/tenants.html','🏢','Tenants'],
    ['/pages/permissions-pro.html','🛡','Permissions'],
    ['/pages/users.html','👤','Users'],
    ['/pages/collections.html','📦','Collections'],
    ['/pages/fields.html','📄','Fields'],
    ['/pages/files.html','📁','Files'],
    ['/pages/storage-buckets.html','🪣','Storage Buckets'],
    ['/pages/api-keys.html','🔑','API Keys'],
    ['/pages/api-key-logs.html','🧠','API Key Logs'],
    ['/pages/api-key-analytics.html','📈','API Key Analytics'],
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
    ['/pages/enterprise-db.html','🗄','Enterprise DB'],
    ['/pages/system-analytics.html','📊','System Analytics'],
    ['/pages/domains.html','🌐','Domains'],
    ['/pages/system-health.html','🩺','System Health'],
    ['/pages/log-viewer.html','📜','Log Viewer'],
    ['/pages/diagnostics-console.html','🧪','Diagnostics Console'],
    ['/pages/queue-monitor.html','🧵','Queue Monitor'],
    ['/pages/backup-monitor.html','🛟','Backup Monitor']
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

  function getCurrentTenant() {
    try {
      return JSON.parse(localStorage.getItem('usg_current_tenant') || 'null');
    } catch {
      return null;
    }
  }

  function setCurrentTenant(tenant) {
    localStorage.setItem('usg_current_tenant', JSON.stringify(tenant || null));
  }

  async function loadTenantOptions() {
    const select = document.getElementById('tenant-switcher');
    if (!select || typeof window.apiFetch !== 'function') return;

    try {
      const res = await window.apiFetch('/api/tenants');
      const rows = await res.json();
      const list = Array.isArray(rows) ? rows : (rows.tenants || rows.data || []);
      const current = getCurrentTenant();

      select.innerHTML =
        '<option value="">No Tenant Selected</option>' +
        list.map(t => `<option value="${t.id}" data-slug="${t.slug || ''}">${t.name || t.slug || t.id}</option>`).join('');

      if (current?.id) {
        select.value = current.id;
      }

      select.addEventListener('change', () => {
        const option = select.options[select.selectedIndex];
        if (!select.value) {
          setCurrentTenant(null);
          return;
        }

        setCurrentTenant({
          id: select.value,
          slug: option.getAttribute('data-slug') || '',
          name: option.textContent
        });
        location.reload();
      });
    } catch {}
  }

  function logoutNow() {
    try {
      localStorage.removeItem('usg_token');
      localStorage.removeItem('usg_user');
      localStorage.removeItem('usg_current_tenant');
      sessionStorage.clear();
    } catch {}
    location.replace('/login.html');
  }

  function buildShell() {
    const shell = document.getElementById('app-shell');
    if (!shell) return;

    const current = location.pathname === '/' ? '/index.html' : location.pathname;
    const tenant = getCurrentTenant();

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
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
            <button class="theme-btn" type="button" data-theme-btn>Dark Mode</button>
            <select id="tenant-switcher" style="min-width:240px;margin:0"></select>
          </div>
          <div class="badges">
            <div class="badge ok"><span class="badge-dot"></span> System Online</div>
            <div class="badge"><span class="badge-dot"></span> Private Platform</div>
            <div class="badge warn"><span class="badge-dot"></span> ${tenant?.slug ? 'Tenant: ' + tenant.slug : 'No Tenant'}</div>
          </div>
        </div>
        <div id="page-content"></div>
      </main>
    `;

    document.getElementById('logout-btn').addEventListener('click', logoutNow);
    const themeBtn = document.querySelector('[data-theme-btn]');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    setTheme(getTheme());
    loadTenantOptions();
  }

  function setupRawToggles(scope = document) {
    scope.querySelectorAll('pre').forEach((pre) => {
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
    getCurrentTenant,
    setCurrentTenant
  };
})();

setTimeout(() => {
  try {
    if (window.USGAppMeta) USGAppMeta.renderFooter();
  } catch {}
}, 50);

setTimeout(() => {
  try {
    if (!window.__DISABLE_HEALTH_BANNER__ && window.USGHealthBanner && document.getElementById('page-content')) {
      USGHealthBanner.render();
    }
  } catch {}
}, 120);
