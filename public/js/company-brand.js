(function () {
  function applyBrand() {
    document.querySelectorAll('.logo').forEach((el) => {
      el.innerHTML = `
        <img
          src="/assets/company-logo.png"
          alt="UNI-SOGOOD"
          style="width:100%;height:100%;object-fit:contain;border-radius:18px"
          onerror="this.style.display='none'; this.parentNode.innerHTML='<span style=&quot;color:#fff;font-size:30px;font-weight:800&quot;>U</span>';"
        >
      `;
    });

    document.querySelectorAll('[data-brand-title]').forEach((el) => {
      el.innerHTML = 'UNI-SOGOOD<br>USG DATA SERVER';
    });

    const path = location.pathname;
    document.querySelectorAll('.nav a').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href === path || (href === '/index.html' && (path === '/' || path === '/index.html'))) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrand);
  } else {
    applyBrand();
  }
})();
