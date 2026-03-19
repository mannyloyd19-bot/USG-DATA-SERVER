(function () {
  function ensureBrand() {
    document.querySelectorAll('.logo').forEach((el) => {
      const imgSrc = '/assets/company-logo.png';
      el.innerHTML = `
        <img
          src="${imgSrc}"
          alt="UNI-SOGOOD"
          onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=&quot;color:#2f6fda;font-size:34px;font-weight:800&quot;>U</span>';"
        >
      `;
    });

    document.querySelectorAll('[data-brand-title]').forEach((el) => {
      el.innerHTML = 'UNI-SOGOOD<br>USG DATA SERVER';
    });
  }

  function markActiveNav() {
    const path = location.pathname;
    document.querySelectorAll('.nav a').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;

      const active =
        href === path ||
        (href === '/index.html' && (path === '/' || path === '/index.html'));

      a.classList.toggle('active', active);
    });
  }

  function injectLoginBrand() {
    const loginCard = document.querySelector('.card');
    const oldBrand = document.querySelector('.brand');
    if (!loginCard || !oldBrand || location.pathname !== '/login.html') return;

    oldBrand.outerHTML = `
      <div class="login-brand-pro">
        <div class="logo-large-wrap">
          <img src="/assets/company-logo.png" class="logo-large" alt="UNI-SOGOOD"
               onerror="this.style.display='none'; this.parentNode.innerHTML='<div style=&quot;width:120px;height:120px;border-radius:24px;background:linear-gradient(180deg,#3d82ee,#2f6fda);display:grid;place-items:center;color:#fff;font-size:42px;font-weight:800&quot;>U</div>';">
        </div>
        <div class="brand-kicker">PRIVATE DATA PLATFORM</div>
        <div class="brand-main">UNI-SOGOOD</div>
        <div class="brand-sub">USG DATA SERVER</div>
      </div>
    `;
  }

  function setupRawToggles() {
    document.querySelectorAll('pre').forEach((pre, index) => {
      if (pre.dataset.rawHandled === 'true') return;
      pre.dataset.rawHandled = 'true';

      const wrapper = document.createElement('div');
      const btn = document.createElement('button');
      btn.className = 'raw-toggle';
      btn.type = 'button';
      btn.textContent = 'Show Raw Data';

      pre.classList.add('raw-json');
      pre.id = pre.id || `raw-json-${index}`;

      btn.addEventListener('click', () => {
        const open = pre.classList.toggle('open');
        btn.textContent = open ? 'Hide Raw Data' : 'Show Raw Data';
      });

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(btn);
      wrapper.appendChild(pre);
    });
  }

  function init() {
    ensureBrand();
    markActiveNav();
    injectLoginBrand();
    setupRawToggles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
