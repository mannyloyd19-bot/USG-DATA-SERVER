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
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
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
      container.prepend(btn);
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
        <div class="status-badge success"><span class="status-dot"></span> Platform Online</div>
        <div class="status-badge"><span class="status-dot"></span> NexaCore Platform</div>
        <div class="status-badge warn"><span class="status-dot"></span> Admin Mode</div>
      `;
      host.appendChild(row);
    });
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
    setTheme(getTheme());
    ensureToggle();
    injectBadges();
    setupRawToggles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
