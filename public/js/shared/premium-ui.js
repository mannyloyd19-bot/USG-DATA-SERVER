window.USGPremiumUI = {
  addSkeleton(container, lines = 3) {
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.style.marginTop = '12px';

    let html = '';
    for (let i = 0; i < lines; i++) {
      html += `<div class="usg-skeleton" style="height:${i === 0 ? 20 : 14}px;width:${i === 0 ? '38%' : (82 - i * 8) + '%'};margin-bottom:10px;"></div>`;
    }
    wrap.innerHTML = html;
    container.appendChild(wrap);
    return wrap;
  },

  pulseButton(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.02)' },
        { transform: 'scale(1)' }
      ],
      {
        duration: 900,
        iterations: 1,
        easing: 'ease'
      }
    );
  }
};
