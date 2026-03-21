window.USGCrudKit = {
  async create({ title = 'Create', fields = [], endpoint, onDone }) {
    USGFormModal({
      title,
      fields,
      onSubmit: async (data) => {
        try {
          const res = await apiFetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const result = await res.json();

          if (!res.ok) {
            USGIOSAlert.show({
              title: `${title} Failed`,
              message: result.message || 'Request failed',
              type: 'error'
            });
            return;
          }

          USGIOSAlert.show({
            title: 'Saved',
            message: result.message || `${title} completed`
          });

          if (typeof onDone === 'function') onDone(result);
        } catch (err) {
          USGIOSAlert.show({
            title: `${title} Failed`,
            message: err.message,
            type: 'error'
          });
        }
      }
    });
  },

  async edit({ title = 'Edit', fields = [], endpoint, initial = {}, onDone }) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';

    const box = document.createElement('div');
    box.style.background = '#fff';
    box.style.borderRadius = '20px';
    box.style.padding = '20px';
    box.style.width = '420px';

    const inputs = fields.map(f => `
      <input id="crud-${f.name}" placeholder="${f.label}" value="${(initial[f.name] ?? '').toString().replace(/"/g, '&quot;')}" style="width:100%;margin-bottom:10px">
    `).join('');

    box.innerHTML = `
      <h3>${title}</h3>
      ${inputs}
      <div style="display:flex;justify-content:flex-end;gap:10px">
        <button id="crud-cancel">Cancel</button>
        <button id="crud-save">Save</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.querySelector('#crud-cancel').onclick = () => overlay.remove();

    box.querySelector('#crud-save').onclick = async () => {
      const data = {};
      fields.forEach(f => {
        data[f.name] = box.querySelector(`#crud-${f.name}`).value;
      });

      try {
        const res = await apiFetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();

        if (!res.ok) {
          USGIOSAlert.show({
            title: `${title} Failed`,
            message: result.message || 'Update failed',
            type: 'error'
          });
          return;
        }

        overlay.remove();
        USGIOSAlert.show({ title: 'Updated', message: result.message || 'Update completed' });
        if (typeof onDone === 'function') onDone(result);
      } catch (err) {
        USGIOSAlert.show({
          title: `${title} Failed`,
          message: err.message,
          type: 'error'
        });
      }
    };
  },

  async remove({ title = 'Delete', message = 'Delete this item?', endpoint, onDone }) {
    const ok = await USGConfirm(message);
    if (!ok) return;

    try {
      const res = await apiFetch(endpoint, { method: 'DELETE' });
      const result = await res.json();

      if (!res.ok) {
        USGIOSAlert.show({
          title: `${title} Failed`,
          message: result.message || 'Delete failed',
          type: 'error'
        });
        return;
      }

      USGIOSAlert.show({ title: 'Deleted', message: result.message || 'Item removed' });
      if (typeof onDone === 'function') onDone(result);
    } catch (err) {
      USGIOSAlert.show({
        title: `${title} Failed`,
        message: err.message,
        type: 'error'
      });
    }
  }
};
