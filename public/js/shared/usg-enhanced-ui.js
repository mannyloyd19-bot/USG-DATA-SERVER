(function () {
  function toast(title, message = '', type = 'info') {
    if (window.USGIOSAlert && typeof window.USGIOSAlert.show === 'function') {
      return window.USGIOSAlert.show({ title, message, type });
    }
    alert(title + (message ? '\n' + message : ''));
  }

  function success(title, message = '') {
    toast(title, message, 'success');
  }

  function error(title, message = '') {
    toast(title, message, 'error');
  }

  function info(title, message = '') {
    toast(title, message, 'info');
  }

  function loadingCard(text = 'Loading...') {
    return `<section class="card"><div class="muted">${text}</div></section>`;
  }

  function emptyCard(title = 'No data found', subtitle = '') {
    if (window.USGPageKit && typeof window.USGPageKit.emptyState === 'function') {
      return window.USGPageKit.emptyState({ title, subtitle });
    }
    return `<section class="card"><div class="muted">${title}</div>${subtitle ? `<div class="muted">${subtitle}</div>` : ''}</section>`;
  }

  function confirmAction(message = 'Are you sure?') {
    return window.confirm(message);
  }

  function withBasicPageShell(content, opts = {}) {
    const title = opts.title || 'Section';
    const kicker = opts.kicker || 'MODULE';
    const subtitle = opts.subtitle || '';
    return `
      <section class="card">
        <div class="kicker">${kicker}</div>
        <h2>${title}</h2>
        ${subtitle ? `<div class="muted">${subtitle}</div>` : ''}
        ${content || ''}
      </section>
    `;
  }

  window.USGEnhancedUI = {
    toast,
    success,
    error,
    info,
    loadingCard,
    emptyCard,
    confirmAction,
    withBasicPageShell
  };
})();
