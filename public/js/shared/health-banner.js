window.USGHealthBanner = {
  async render() {
    try {
      if (window.__DISABLE_HEALTH_BANNER__ === true) return;

      const res = await apiFetch('/api/live-readiness/status');
      const data = await res.json();
      const content = document.getElementById('page-content');
      if (!content || !data) return;

      const old = document.getElementById('usg-health-banner');
      if (old) old.remove();

      const level = Number(data.readinessPercent || 0);
      const status = level >= 90 ? 'READY' : level >= 70 ? 'PARTIAL' : 'ATTENTION';

      const el = document.createElement('section');
      el.id = 'usg-health-banner';
      el.className = 'card usg-health-banner';
      el.innerHTML = `
        <div class="kicker">SYSTEM HEALTH</div>
        <div class="usg-page-head-row">
          <div>
            <h2 style="margin:0">Readiness ${level}%</h2>
            <div class="muted">Current platform status: ${status}</div>
          </div>
          <div class="actions">
            <a href="/pages/live-readiness.html" class="ghost-btn">Open Readiness</a>
            <a href="/pages/boot-diagnostics.html" class="primary-btn">Boot Diagnostics</a>
          </div>
        </div>
      `;
      content.insertAdjacentElement('afterbegin', el);
    } catch {}
  }
};
