window.USGRealCharts = {
  normalize(values) {
    if (!Array.isArray(values) || !values.length) return [0, 0, 0, 0, 0, 0];
    return values.map(v => Number(v || 0));
  },

  lineSVG(values, opts = {}) {
    const pts = this.normalize(values);
    const width = opts.width || 100;
    const height = opts.height || 100;
    const padX = opts.padX || 4;
    const padY = opts.padY || 10;
    const max = Math.max(...pts, 1);
    const min = Math.min(...pts, 0);
    const range = Math.max(max - min, 1);
    const step = (width - padX * 2) / Math.max(pts.length - 1, 1);

    const coords = pts.map((v, i) => {
      const x = padX + i * step;
      const y = height - padY - ((v - min) / range) * (height - padY * 2);
      return [x, y];
    });

    const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
    const area = `M ${coords[0][0]} ${height - padY} ` +
      coords.map(([x, y]) => `L ${x} ${y}`).join(' ') +
      ` L ${coords[coords.length - 1][0]} ${height - padY} Z`;

    return `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%;height:${opts.pixelHeight || 140}px;display:block">
        <defs>
          <linearGradient id="usgChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="rgba(118,167,255,0.30)"></stop>
            <stop offset="100%" stop-color="rgba(118,167,255,0.02)"></stop>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#usgChartFill)"></path>
        <path d="${path}" fill="none" stroke="rgba(118,167,255,0.95)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  },

  chartCard(kicker, title, values) {
    return `
      <section class="card">
        <div class="kicker">${kicker}</div>
        <h2>${title}</h2>
        ${this.lineSVG(values, { pixelHeight: 130 })}
      </section>
    `;
  }
};
