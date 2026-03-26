(function () {
  let refreshTimer = null;

  async function safeJson(url, options) {
    try {
      if (typeof window.apiFetch === 'function') {
        const res = await window.apiFetch(url, options || {});
        return await res.json();
      }
      return {};
    } catch {
      return {};
    }
  }

  function ensureBellStyles() {
    if (document.getElementById('usg-topbar-bell-styles')) return;

    const style = document.createElement('style');
    style.id = 'usg-topbar-bell-styles';
    style.textContent = `
      .usg-bell-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .usg-bell-btn {
        position: relative;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: 22px;
        line-height: 1;
        padding: 6px 8px;
        border-radius: 12px;
        box-shadow: none;
      }

      .usg-bell-btn:hover {
        background: rgba(255,255,255,0.06);
      }

      .usg-bell-badge {
        position: absolute;
        top: 0;
        right: 0;
        min-width: 18px;
        height: 18px;
        border-radius: 999px;
        padding: 0 5px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        background: #ef4444;
        color: #fff;
        box-shadow: 0 4px 14px rgba(239,68,68,0.35);
      }

      .usg-bell-panel {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: min(380px, 92vw);
        max-height: 460px;
        overflow-y: auto;
        border-radius: 18px;
        padding: 14px;
        z-index: 9999;
        background: rgba(15,23,42,0.96);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 20px 40px rgba(0,0,0,0.22);
        display: none;
      }

      .usg-bell-panel.open {
        display: block;
      }

      .usg-bell-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }

      .usg-bell-head h3 {
        margin: 0;
        font-size: 16px;
      }

      .usg-bell-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .usg-bell-link,
      .usg-bell-markall {
        border: 0;
        background: rgba(255,255,255,0.08);
        color: inherit;
        padding: 8px 10px;
        border-radius: 12px;
        cursor: pointer;
        text-decoration: none;
        font-size: 12px;
      }

      .usg-bell-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .usg-bell-item {
        padding: 12px;
        border-radius: 14px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.06);
      }

      .usg-bell-item.unread {
        background: rgba(59,130,246,0.10);
        border-color: rgba(96,165,250,0.16);
      }

      .usg-bell-item strong {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .usg-bell-meta {
        font-size: 12px;
        opacity: 0.75;
        margin-top: 6px;
      }

      .usg-bell-empty {
        padding: 14px;
        border-radius: 14px;
        background: rgba(255,255,255,0.04);
        font-size: 13px;
        opacity: 0.82;
      }

      :root[data-theme="light"] .usg-bell-panel {
        background: rgba(255,255,255,0.96);
        color: #0f172a;
        border: 1px solid rgba(15,23,42,0.08);
        box-shadow: 0 18px 38px rgba(15,23,42,0.12);
      }

      :root[data-theme="light"] .usg-bell-item {
        background: rgba(15,23,42,0.03);
        border-color: rgba(15,23,42,0.06);
      }

      :root[data-theme="light"] .usg-bell-item.unread {
        background: rgba(59,130,246,0.08);
        border-color: rgba(59,130,246,0.12);
      }

      :root[data-theme="light"] .usg-bell-link,
      :root[data-theme="light"] .usg-bell-markall {
        background: rgba(15,23,42,0.06);
      }
    `;
    document.head.appendChild(style);
  }

  function panelItemHtml(item) {
    const title = item?.title || 'Notification';
    const message = item?.message || '-';
    const source = item?.source || 'system';
    const time = item?.createdAt || '-';
    const unread = !item?.read ? ' unread' : '';
    return `
      <div class="usg-bell-item${unread}">
        <strong>${title}</strong>
        <div>${message}</div>
        <div class="usg-bell-meta">${source} · ${time}</div>
      </div>
    `;
  }

  async function refreshBell() {
    const badge = document.getElementById('usg-bell-badge');
    const list = document.getElementById('usg-bell-list');
    if (!badge || !list) return;

    const payload = await safeJson('/api/notifications');
    const rows = Array.isArray(payload.notifications) ? payload.notifications : [];
    const unread = Number(payload.unread || 0);

    if (unread > 0) {
      badge.textContent = unread > 99 ? '99+' : String(unread);
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }

    list.innerHTML = rows.length
      ? rows.slice(0, 8).map(panelItemHtml).join('')
      : '<div class="usg-bell-empty">No notifications found.</div>';
  }

  function closePanelOnOutsideClick(event) {
    const panel = document.getElementById('usg-bell-panel');
    const wrap = document.getElementById('usg-bell-wrap');
    if (!panel || !wrap) return;
    if (!wrap.contains(event.target)) {
      panel.classList.remove('open');
    }
  }

  function ensureBell() {
    ensureBellStyles();

    const topbar = document.querySelector('#app-shell .topbar');
    if (!topbar) return;

    let host = topbar.querySelector('.badges');
    if (!host) {
      host = document.createElement('div');
      host.className = 'badges';
      topbar.appendChild(host);
    }

    if (document.getElementById('usg-bell-wrap')) return;

    const wrap = document.createElement('div');
    wrap.className = 'usg-bell-wrap';
    wrap.id = 'usg-bell-wrap';

    wrap.innerHTML = `
      <button class="usg-bell-btn" id="usg-bell-btn" type="button" aria-label="Notifications">
        🔔
        <span class="usg-bell-badge" id="usg-bell-badge" style="display:none">0</span>
      </button>

      <div class="usg-bell-panel" id="usg-bell-panel">
        <div class="usg-bell-head">
          <h3>Notifications</h3>
          <div class="usg-bell-actions">
            <button class="usg-bell-markall" id="usg-bell-markall" type="button">Mark All Read</button>
            <a class="usg-bell-link" href="/pages/notifications.html">Open Page</a>
          </div>
        </div>
        <div class="usg-bell-list" id="usg-bell-list"></div>
      </div>
    `;

    host.prepend(wrap);

    document.getElementById('usg-bell-btn').addEventListener('click', async () => {
      const panel = document.getElementById('usg-bell-panel');
      if (!panel) return;
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) {
        await refreshBell();
      }
    });

    document.getElementById('usg-bell-markall').addEventListener('click', async () => {
      await safeJson('/api/notifications/mark-all-read', { method: 'POST' });
      await refreshBell();
    });

    document.removeEventListener('click', closePanelOnOutsideClick);
    document.addEventListener('click', closePanelOnOutsideClick);

    refreshBell();

    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(refreshBell, 20000);
  }

  function installWrapper() {
    if (!window.USGShell || typeof window.USGShell.buildShell !== 'function') {
      setTimeout(installWrapper, 120);
      return;
    }

    if (window.USGShell.__topbarBellWrapped) return;

    const originalBuildShell = window.USGShell.buildShell.bind(window.USGShell);

    window.USGShell.buildShell = function () {
      const result = originalBuildShell();
      setTimeout(ensureBell, 0);
      setTimeout(refreshBell, 120);
      return result;
    };

    window.USGShell.__topbarBellWrapped = true;

    if (document.getElementById('app-shell')) {
      setTimeout(ensureBell, 0);
      setTimeout(refreshBell, 120);
    }
  }

  installWrapper();
})();
