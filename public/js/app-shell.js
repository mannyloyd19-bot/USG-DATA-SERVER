window.__DISABLE_HEALTH_BANNER__ = window.__DISABLE_HEALTH_BANNER__ ?? false;

function forceContentTop() {
  try {
    const main = document.querySelector('#app-shell .main');
    if (main) main.scrollTop = 0;

    const page = document.getElementById('page-content');
    if (page) page.scrollTop = 0;
  } catch {}
}

window.addEventListener('load', () => {
  setTimeout(forceContentTop, 0);
  setTimeout(forceContentTop, 80);
});

window.addEventListener('pageshow', () => {
  setTimeout(forceContentTop, 0);
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
    setTimeout(forceContentTop, 0);
    setTimeout(forceContentTop, 80);
  }
} catch {}

(function () {
  const NAV_GROUPS = [
    {
      title: 'Overview',
      items: [
        ['/index.html', 'Dashboard'],
        ['/pages/search.html', 'Global Search'],
        ['/pages/docs.html', 'Docs']
      ]
    },
    {
      title: 'Core Data',
      items: [
        ['/pages/collections.html', 'Collections'],
        ['/pages/fields.html', 'Fields'],
        ['/pages/records.html', 'Records'],
        ['/pages/files.html', 'Files'],
        ['/pages/storage-buckets.html', 'Storage Buckets'],
        ['/pages/storage-admin.html', 'Storage Admin'],
        ['/pages/index-manager.html', 'Index Manager'],
        ['/pages/functions.html', 'Functions'],
        ['/pages/query-builder.html', 'Query Builder'],
        ['/pages/relationships.html', 'Relationships'],
        ['/pages/relational.html', 'Relational']
      ]
    },
    {
      title: 'Identity & Access',
      items: [
        ['/pages/tenants.html', 'Tenants'],
        ['/pages/users.html', 'Users'],
        ['/pages/sessions.html', 'Sessions'],
        ['/pages/auth-security.html', 'Auth Security'],
        ['/pages/auth-providers.html', 'Auth Providers'],
        ['/pages/permissions-pro.html', 'Permissions'],
        ['/pages/permissions-matrix.html', 'Permissions Matrix'],
        ['/pages/rbac.html', 'RBAC'],
        ['/pages/api-keys.html', 'API Keys'],
        ['/pages/api-key-logs.html', 'API Key Logs'],
        ['/pages/api-key-analytics.html', 'API Key Analytics']
      ]
    },
    {
      title: 'Billing & Business',
      items: [
        ['/pages/billing.html', 'Billing'],
        ['/pages/payments.html', 'Payments'],
        ['/pages/invoices.html', 'Invoices'],
        ['/pages/payment-gateways.html', 'Payment Gateways'],
        ['/pages/tenant-overview.html', 'Tenant Overview'],
        ['/pages/tenant-quotas.html', 'Tenant Quotas']
      ]
    },
    {
      title: 'Infra & Ops',
      items: [
        ['/pages/apps.html', 'Apps'],
        ['/pages/deployments.html', 'Deployments'],
        ['/pages/app-logs.html', 'App Logs'],
        ['/pages/backups.html', 'Backups'],
        ['/pages/backup-system.html', 'Backup System'],
        ['/pages/backup-monitor.html', 'Backup Monitor'],
        ['/pages/backup-restore.html', 'Backup Restore'],
        ['/pages/system-health.html', 'System Health'],
        ['/pages/system-audit.html', 'System Audit'],
        ['/pages/live-readiness.html', 'Live Readiness'],
        ['/pages/diagnostics-console.html', 'Diagnostics'],
        ['/pages/log-viewer.html', 'Log Viewer'],
        ['/pages/network-center.html', 'Network Center'],
        ['/pages/infrastructure.html', 'Infrastructure'],
        ['/pages/ssl-center.html', 'SSL Center'],
        ['/pages/domains.html', 'Domains'],
        ['/pages/domain-diagnostics.html', 'Domain Diagnostics']
      ]
    },
    {
      title: 'Realtime & Automation',
      items: [
        ['/pages/webhooks.html', 'Webhooks'],
        ['/pages/realtime.html', 'Realtime'],
        ['/pages/realtime-events.html', 'Realtime Events'],
        ['/pages/realtime-monitor.html', 'Realtime Monitor'],
        ['/pages/notifications.html', 'Notifications'],
        ['/pages/queue-monitor.html', 'Queue Monitor']
      ]
    },
    {
      title: 'Future Systems',
      items: [
        ['/pages/database-center.html', 'Database Center'],
        ['/pages/firebase-center.html', 'Firebase Center'],
        ['/pages/supabase-center.html', 'Supabase Center'],
        ['/pages/cloud-center.html', 'Cloud Center'],
        ['/pages/advanced-systems.html', 'Advanced Systems']
      ]
    },
    {
      title: 'Tools',
      items: [
        ['/pages/sdk.html', 'SDK'],
        ['/pages/settings.html', 'Settings']
      ]
    },
    {
      title: 'Account',
      items: [
        ['#logout', 'Logout']
      ]
    }
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
        list.map((t) => `<option value="${t.id}" data-slug="${t.slug || ''}">${t.name || t.slug || t.id}</option>`).join('');

      if (current && current.id) {
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

  function renderGroupedNav(current) {
    return `
      <nav class="nav grouped-nav">
        ${NAV_GROUPS.map((group) => `
          <div class="nav-group">
            <div class="nav-group-title">${group.title}</div>
            <div class="nav-group-items">
              ${group.items.map(([href, label]) => {
                if (href === '#logout') {
                  return `
                    <button type="button" id="logout-btn" class="nav-text-btn">
                      <span class="nav-text-label">${label}</span>
                    </button>
                  `;
                }

                return `
                  <a href="${href}" class="nav-text-link ${href === current ? 'active' : ''}">
                    <span class="nav-text-label">${label}</span>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </nav>
    `;
  }

  function buildShell() {
    const root = document.getElementById('app-shell');
    if (!root) return;

    const current = location.pathname === '/' ? '/index.html' : location.pathname;
    const tenant = getCurrentTenant();

    root.classList.add('shell');

    root.innerHTML = `
      <aside class="sidebar">
        <div class="brand">
          <div class="logo">
            <img src="/assets/company-logo.png" alt="NexaCore"
                 onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=&quot;color:#2f6fda;font-size:34px;font-weight:800&quot;>U</span>';">
          </div>
          <div>
            <div class="kicker">NexaCore Platform Engine</div>
            <div class="brand-title">NexaCore</div>
              <div class="brand-subtitle">Database, cloud, auth, files, automations, billing, and advanced systems in one control platform.</div>
          </div>
        </div>

        ${renderGroupedNav(current)}

        <div class="sidebar-footer">
  <button id="dev-token-btn" type="button" onclick="window.__USG_DEV_TOOLS__.toggleTokenPanel()" style="margin-top:10px;padding:8px 10px;border-radius:10px;border:1px solid rgba(148,163,184,.25);background:transparent;color:inherit;font-size:12px;cursor:pointer;opacity:.75;">
    Show Token
  </button>
  
          <div>nexacore · v1.1.1</div>
          <div>development · NexaCore system patch 1.1.1</div>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
      <input id="usg-global-search" placeholder="Search users, collections, records, files..." style="margin-left:20px;padding:6px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:transparent;color:inherit;min-width:320px;">
    
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
            <button class="theme-btn" type="button" data-theme-btn>Dark Mode</button>
            <select id="tenant-switcher" style="min-width:240px;margin:0"></select>
          </div>
          <div class="badges">
            <div class="badge ok"><span class="badge-dot"></span> Platform Online</div>
            <div class="badge"><span class="badge-dot"></span> NexaCore Platform</div>
            <div class="badge warn"><span class="badge-dot"></span> ${tenant && tenant.slug ? 'Tenant: ' + tenant.slug : 'No Tenant'}</div>
          </div>
        </div>
        <div id="page-content"></div>
      </main>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutNow);

    const themeBtn = document.querySelector('[data-theme-btn]');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const globalSearch = document.getElementById('usg-global-search');
    if (globalSearch) {
      globalSearch.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        const q = String(globalSearch.value || '').trim();
        if (!q) {
          location.href = '/pages/search.html';
          return;
        }
        location.href = '/pages/search.html?q=' + encodeURIComponent(q);
      });
    }

    setTheme(getTheme());
    loadTenantOptions();
    setTimeout(forceContentTop, 0);
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
    if (window.USGAppMeta) window.USGAppMeta.renderFooter();
  } catch {}
}, 50);

setTimeout(() => {
  try {
    if (!window.__DISABLE_HEALTH_BANNER__ && window.USGHealthBanner && document.getElementById('page-content')) {
      window.USGHealthBanner.render();
    }
  } catch {}
}, 120);

try {
  if (!document.querySelector('script[data-usg-topbar-notifications]')) {
    const script = document.createElement('script');
    script.src = '/js/shared/topbar-notifications.js';
    script.setAttribute('data-usg-topbar-notifications', '1');
    document.body.appendChild(script);
  }
} catch {}





try {
  window.__USG_DEV_TOOLS__ = {
    toggleTokenPanel() {
      try {
        const token = localStorage.getItem('usg_token') || 'No token found';
        let panel = document.getElementById('dev-token-panel');
        const footer = document.querySelector('.sidebar-footer');

        if (!footer) return;

        if (!panel) {
          panel = document.createElement('div');
          panel.id = 'dev-token-panel';
          panel.style.marginTop = '12px';
          panel.style.padding = '10px';
          panel.style.borderRadius = '12px';
          panel.style.fontSize = '11px';
          panel.style.lineHeight = '1.45';
          panel.style.wordBreak = 'break-all';
          panel.style.maxHeight = '140px';
          panel.style.overflow = 'auto';
          panel.style.background = 'rgba(0,0,0,0.05)';
          panel.style.border = '1px solid rgba(148,163,184,.20)';
          panel.style.display = 'none';
          footer.appendChild(panel);
        }

        if (panel.style.display === 'none') {
          panel.textContent = token;
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      } catch (e) {}
    }
  };
} catch {}

document.addEventListener("input", function(e){
  if(e.target && e.target.id === "usg-global-search"){
    const q = e.target.value;
    if(q.length > 2){
      window.location.href = "/pages/search.html?q=" + encodeURIComponent(q);
    }
  }
});
