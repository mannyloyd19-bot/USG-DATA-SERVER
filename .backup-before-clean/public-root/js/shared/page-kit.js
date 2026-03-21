window.USGPageKit = {
  setPageHeader({ title = 'Page', subtitle = '', kicker = 'USG', actions = [] } = {}) {
    const content = document.getElementById('page-content');
    if (!content) return;

    const actionsHtml = actions.map((a, i) => {
      const cls = a.primary ? 'primary-btn' : 'ghost-btn';
      return `<button class="${cls}" type="button" data-page-action="${i}">${a.label}</button>`;
    }).join('');

    const html = `
      <section class="hero card usg-page-header">
        <div class="kicker">${kicker}</div>
        <div class="usg-page-head-row">
          <div>
            <h1 class="usg-page-title">${title}</h1>
            <div class="muted usg-page-subtitle">${subtitle}</div>
          </div>
          <div class="actions">${actionsHtml}</div>
        </div>
      </section>
    `;

    content.insertAdjacentHTML('afterbegin', html);

    actions.forEach((a, i) => {
      const btn = content.querySelector(`[data-page-action="${i}"]`);
      if (btn && typeof a.onClick === 'function') {
        btn.addEventListener('click', a.onClick);
      }
    });
  },

  searchToolbar({ placeholder = 'Search...', filters = [] } = {}) {
    const filtersHtml = filters.map((f, i) => `
      <select data-usg-filter="${i}">
        ${(f.options || []).map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
      </select>
    `).join('');

    return `
      <div class="card usg-toolbar-card">
        <div class="usg-toolbar-row">
          <input id="usg-global-search" placeholder="${placeholder}">
          ${filtersHtml}
        </div>
      </div>
    `;
  },

  emptyState({ title = 'No data yet', message = 'Nothing to show.' } = {}) {
    return `
      <div class="card usg-empty-state">
        <div class="kicker">EMPTY STATE</div>
        <h2>${title}</h2>
        <div class="muted">${message}</div>
      </div>
    `;
  },

  loadingState({ label = 'Loading...' } = {}) {
    return `
      <div class="card usg-loading-state">
        <div class="usg-skeleton usg-skeleton-lg"></div>
        <div class="usg-skeleton"></div>
        <div class="usg-skeleton"></div>
        <div class="muted" style="margin-top:12px">${label}</div>
      </div>
    `;
  },

  infoCard(title, value, sub = '') {
    return `
      <div class="info-card">
        <div class="info-title">${title}</div>
        <div class="info-value">${value}</div>
        ${sub ? `<div class="muted" style="margin-top:8px">${sub}</div>` : ''}
      </div>
    `;
  },

  statusBadge(value = 'unknown') {
    const v = String(value).toLowerCase();
    const cls = ['active','ready','success','online','enabled'].includes(v) ? 'ok'
      : ['pending','warning','disabled'].includes(v) ? 'warn'
      : 'warn';
    return `<div class="badge ${cls}"><span class="badge-dot"></span>${value}</div>`;
  },

  copyButton(text = '', label = 'Copy') {
    const encoded = encodeURIComponent(text);
    return `<button class="ghost-btn" type="button" data-copy="${encoded}">${label}</button>`;
  },

  wireCopyButtons(scope = document) {
    scope.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = decodeURIComponent(btn.getAttribute('data-copy') || '');
        try {
          await navigator.clipboard.writeText(text);
          if (window.USGIOSAlert) {
            USGIOSAlert.show({ title: 'Copied', message: text || 'Value copied successfully.' });
          }
        } catch {
          if (window.USGIOSAlert) {
            USGIOSAlert.show({ title: 'Copy Failed', message: 'Could not copy value.', type: 'error' });
          }
        }
      });
    });
  },

  attachBasicSearch({ inputId = 'usg-global-search', itemSelector = '.list-card', textSelector = null } = {}) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll(itemSelector).forEach(item => {
        const source = textSelector ? (item.querySelector(textSelector)?.textContent || '') : item.textContent || '';
        item.style.display = source.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
};
