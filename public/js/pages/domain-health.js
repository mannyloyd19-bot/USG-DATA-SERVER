window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function card(title, desc, href) {
  return `
    <div class="list-card">
      <strong>${title}</strong><br>
      <span class="muted">${desc}</span>
      <div class="actions">
        <a class="primary-btn" href="${href}">Open</a>
      </div>
    </div>
  `;
}

async function loadDomainHealthHub() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'DOMAIN HEALTH',
    title: 'Domain + SSL Console',
    subtitle: 'Centralized access for domain operations, SSL diagnostics, and public routing health'
  });

  content.innerHTML = `
    <section class="card">
      <div class="kicker">TOOLS</div>
      <h2>Domain Modules</h2>
      ${card('Domains', 'Domain CRUD, binding, and app access setup.', '/pages/domains.html')}
      ${card('Domain Diagnostics', 'SSL status, bind health, and deep checks.', '/pages/domain-diagnostics.html')}
      ${card('SSL Center', 'Certificate and SSL-focused operational page.', '/pages/ssl-center.html')}
    </section>
  `;
}
loadDomainHealthHub();
