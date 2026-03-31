(function () {
  function enhanceLoginPage() {
    if (document.querySelector('.nexacore-login-hero')) return;

    const looksLikeLogin =
      location.pathname.endsWith('/login.html') ||
      /login/i.test(document.title) ||
      document.querySelector('input[type="password"]');

    if (!looksLikeLogin) return;

    document.body.classList.add('nexacore-login-body');

    const shell =
      document.querySelector('.login-shell') ||
      document.querySelector('.login-container') ||
      document.querySelector('.auth-shell') ||
      document.querySelector('main') ||
      document.body;

    const hero = document.createElement('section');
    hero.className = 'nexacore-login-hero';
    hero.innerHTML = `
      <div class="nexacore-logo-login">
        <img src="/assets/company-logo.png" alt="NexaCore">
      </div>
      <div class="kicker">Private Platform Engine</div>
      <h1 class="nexacore-login-title">NexaCore</h1>
      <p class="nexacore-login-subtitle">
        Unified control center for data, identity, cloud services, automation, and advanced platform systems.
      </p>
      <div class="nexacore-login-badges">
        <div class="nexacore-login-badge">Database Ready</div>
        <div class="nexacore-login-badge">Cloud Connected</div>
        <div class="nexacore-login-badge">Secure Access</div>
      </div>
    `;

    shell.insertBefore(hero, shell.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceLoginPage);
  } else {
    enhanceLoginPage();
  }
})();
