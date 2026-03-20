window.USGIOSAlert = {
  show({ title = 'Notice', message = '', type = 'info' } = {}) {
    const old = document.getElementById('usg-ios-alert-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'usg-ios-alert-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.45)';
    overlay.style.backdropFilter = 'blur(8px)';
    overlay.style.zIndex = '99999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '24px';

    const card = document.createElement('div');
    card.style.width = 'min(420px, 92vw)';
    card.style.background = 'rgba(255,255,255,0.92)';
    card.style.color = '#111';
    card.style.borderRadius = '26px';
    card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)';
    card.style.padding = '22px 22px 18px';
    card.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.fontSize = '28px';
    titleEl.style.fontWeight = '700';
    titleEl.style.lineHeight = '1.15';
    titleEl.style.marginBottom = '14px';

    const msgEl = document.createElement('div');
    msgEl.textContent = message || 'Something went wrong.';
    msgEl.style.fontSize = '17px';
    msgEl.style.lineHeight = '1.45';
    msgEl.style.color = '#333';
    msgEl.style.whiteSpace = 'pre-wrap';

    const btnWrap = document.createElement('div');
    btnWrap.style.display = 'flex';
    btnWrap.style.justifyContent = 'flex-end';
    btnWrap.style.marginTop = '22px';

    const btn = document.createElement('button');
    btn.textContent = 'OK';
    btn.style.border = 'none';
    btn.style.background = 'transparent';
    btn.style.color = type === 'error' ? '#c26a1b' : '#0a84ff';
    btn.style.fontSize = '22px';
    btn.style.fontWeight = '500';
    btn.style.padding = '8px 12px';
    btn.style.cursor = 'pointer';

    btn.onclick = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    btnWrap.appendChild(btn);
    card.appendChild(titleEl);
    card.appendChild(msgEl);
    card.appendChild(btnWrap);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }
};
