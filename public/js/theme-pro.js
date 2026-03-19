(function () {
  const KEY = 'usg_theme';

  function getTheme() {
    return localStorage.getItem(KEY) || 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    updateToggle(theme);
  }

  function toggleTheme() {
    const current = getTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  function updateToggle(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  }

  function ensureToggle() {
    document.querySelectorAll('[data-top-actions]').forEach((container) => {
      if (container.querySelector('[data-theme-toggle]')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-toggle';
      btn.setAttribute('data-theme-toggle', 'true');
      btn.addEventListener('click', toggleTheme);
      container.appendChild(btn);
    });
    updateToggle(getTheme());
  }

  function injectBadges() {
    document.querySelectorAll('[data-badge-host]').forEach((host) => {
      if (host.dataset.badgesReady === 'true') return;
      host.dataset.badgesReady = 'true';

      const row = document.createElement('div');
      row.className = 'badge-row';
      row.innerHTML = `
        <div class="status-badge success"><span class="status-dot"></span> System Online</div>
        <div class="status-badge"><span class="status-dot"></span> Private Platform</div>
        <div class="status-badge warn"><span class="status-dot"></span> Admin Mode</div>
      `;
      host.appendChild(row);
    });
  }

  function init() {
    setTheme(getTheme());
    ensureToggle();
    injectBadges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
