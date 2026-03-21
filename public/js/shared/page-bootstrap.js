window.USGPageBootstrap = {
  init(pageName = 'Page') {
    try {
      if (typeof requireAuth === 'function') requireAuth();
      if (window.USGShell) USGShell.buildShell();
    } catch (e) {
      console.warn('Shell init failed', e);
    }

    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = `
      <div class="card">
        <div class="kicker">LOADING</div>
        <h2>${pageName}</h2>
        <div class="muted">Initializing page...</div>
      </div>
    `;
  },

  error(err) {
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = `
      <div class="card">
        <div class="kicker">ERROR</div>
        <h2>Page Failed</h2>
        <div class="muted">${err.message || err}</div>
      </div>
    `;
  }
};
