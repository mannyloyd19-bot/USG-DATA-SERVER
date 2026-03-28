(function () {
  const LABELS = {
    '/index.html': { icon: '🏠', label: 'Dashboard', title: 'Dashboard' },
    '/pages/permissions-pro.html': { icon: '🛡', label: 'Permissions', title: 'Permissions Pro' },
    '/pages/users.html': { icon: '👤', label: 'Users', title: 'Users' },
    '/pages/collections.html': { icon: '📦', label: 'Collections', title: 'Collections' },
    '/pages/fields.html': { icon: '📄', label: 'Fields', title: 'Fields' },
    '/pages/files.html': { icon: '📁', label: 'Files', title: 'Files' },
    '/pages/api-keys.html': { icon: '🔑', label: 'API Keys', title: 'API Keys' },
    '/pages/relational.html': { icon: '🗂', label: 'Relational', title: 'Relational' },
    '/pages/relationships.html': { icon: '🔗', label: 'Relations', title: 'Relationships' },
    '/pages/webhooks.html': { icon: '🪝', label: 'Webhooks', title: 'Webhooks' },
    '/pages/realtime.html': { icon: '📡', label: 'Realtime', title: 'Realtime' },
    '/pages/settings.html': { icon: '⚙', label: 'Settings', title: 'Settings' },
    '/pages/audit-logs.html': { icon: '🧾', label: 'Audit Logs', title: 'Audit Logs' },
    '/pages/backups.html': { icon: '💾', label: 'Backups', title: 'Backups' },
    '/pages/sdk.html': { icon: '🧩', label: 'SDK', title: 'SDK' },
    '/pages/release.html': { icon: '🚀', label: 'Release', title: 'Release' },
    '/pages/query-builder.html': { icon: '📊', label: 'Query', title: 'Query Builder' },
    '/pages/enterprise-db.html': { icon: '🗄', label: 'Enterprise', title: 'Enterprise DB' }
    '/pages/billing.html': { icon: '💳', label: 'Billing', title: 'Billing' },
    '/pages/payments.html': { icon: '💰', label: 'Payments', title: 'Payments' },
    '/pages/invoices.html': { icon: '🧾', label: 'Invoices', title: 'Invoices' },
    '/pages/payment-gateways.html': { icon: '🏦', label: 'Payment Gateways', title: 'Payment Gateways' },
  };

  function decorateNav() {
    document.querySelectorAll('.nav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const meta = LABELS[href];
      if (!meta) return;
      if (a.dataset.sidebarReady === 'true') return;
      a.dataset.sidebarReady = 'true';
      a.title = meta.title;
      a.innerHTML = `<span class="nav-icon">${meta.icon}</span><span class="nav-label">${meta.label}</span>`;
    });

    document.querySelectorAll('.nav button[data-logout]').forEach((btn) => {
      if (btn.dataset.sidebarReady === 'true') return;
      btn.dataset.sidebarReady = 'true';
      btn.title = 'Logout';
      btn.innerHTML = `<span class="nav-icon">🚪</span><span class="nav-label">Logout</span>`;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateNav);
  } else {
    decorateNav();
  }
})();
