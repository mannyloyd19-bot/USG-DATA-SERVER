(function () {
  function applyBrand() {
    document.querySelectorAll('.logo').forEach((el) => {
      el.innerHTML = `
        <img
          src="/assets/company-logo.png"
          alt="NexaCore"
          onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=&quot;color:#2f6fda;font-size:34px;font-weight:800&quot;>U</span>';"
        >
      `;
    });

    document.querySelectorAll('[data-brand-title]').forEach((el) => {
      el.innerHTML = 'NexaCore';
    });

    const path = location.pathname;
    document.querySelectorAll('.nav a').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      const active = href === path || (href === '/index.html' && (path === '/' || path === '/index.html'));
      a.classList.toggle('active', active);
    });

    if (location.pathname === '/login.html') {
      const oldBrand = document.querySelector('.brand');
      const loginCard = document.querySelector('.card');
      if (oldBrand && loginCard && !document.querySelector('.login-brand-pro')) {
        oldBrand.outerHTML = `
          <div class="login-brand-pro">
            <div class="logo-large-wrap">
              <img src="/assets/company-logo.png" class="logo-large" alt="NexaCore"
                   onerror="this.style.display='none'; this.parentNode.innerHTML='<div style=&quot;width:120px;height:120px;border-radius:24px;background:linear-gradient(180deg,#3d82ee,#2f6fda);display:grid;place-items:center;color:#fff;font-size:42px;font-weight:800&quot;>U</div>';">
            </div>
            <div class="small">NexaCore Platform Engine</div>
            <div style="font-size:24px;font-weight:800;letter-spacing:-.04em;line-height:1.02;">NexaCore</div>
            <div style="font-size:16px;color:var(--muted);margin-top:4px;">NexaCore</div>
          </div>
        `;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrand);
  } else {
    applyBrand();
  }
})();
