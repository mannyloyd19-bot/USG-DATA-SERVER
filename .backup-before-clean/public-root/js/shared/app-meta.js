window.USGAppMeta = {
  async load() {
    try {
      const res = await apiFetch('/api/final-polish/summary');
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  },

  async renderFooter() {
    const data = await this.load();
    const shell = document.getElementById('app-shell');
    if (!shell || !data || !data.app) return;

    let footer = document.getElementById('usg-app-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.id = 'usg-app-footer';
      footer.className = 'usg-app-footer';
      shell.appendChild(footer);
    }

    footer.innerHTML = `
      <div>
        <strong>${data.app.name}</strong> · v${data.app.version}
      </div>
      <div class="muted">
        ${data.app.env} · ${data.app.dbPath}
      </div>
    `;
  }
};
