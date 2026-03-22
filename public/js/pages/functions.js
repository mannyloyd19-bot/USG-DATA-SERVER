window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

function validateFunction(data) {
  const errors = [];
  if (!data.name || !String(data.name).trim()) errors.push('Function name is required');
  if (!data.trigger || !String(data.trigger).trim()) errors.push('Trigger is required');
  return errors;
}

async function loadFunctions() {
  const content = document.getElementById('page-content');
  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'FUNCTIONS',
    title: 'Functions',
    subtitle: 'Manage executable functions, triggers, and runtime actions'
  });

  const top = document.createElement('section');
  top.className = 'card';
  top.innerHTML = `
    <div class="usg-page-head-row">
      <div>
        <div class="kicker">ACTIONS</div>
        <h2>Function Controls</h2>
      </div>
      <div class="actions">
        <button id="create-function-btn" class="primary-btn" type="button">+ Create Function</button>
        <button id="refresh-functions-btn" class="ghost-btn" type="button">Refresh</button>
      </div>
    </div>
  `;
  content.appendChild(top);

  document.getElementById('refresh-functions-btn').onclick = () => loadFunctions();
  document.getElementById('create-function-btn').onclick = () => USGCrudKit.create({
    title: 'Create Function',
    endpoint: '/api/functions',
    validate: validateFunction,
    fields: [
      { name: 'name', label: 'Function Name' },
      { name: 'trigger', label: 'Trigger' },
      { name: 'status', label: 'Status' },
      { name: 'notes', label: 'Notes' }
    ],
    onDone: () => loadFunctions()
  });

  try {
    const res = await apiFetch('/api/functions');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.functions || data.data || []);

    const wrap = document.createElement('section');
    wrap.innerHTML = rows.length ? rows.map(item => `
      <div class="list-card">
        <strong>${item.name || 'Function'}</strong><br>
        <span class="muted">Trigger: ${item.trigger || '-'}</span><br>
        <span class="muted">Status: ${item.status || '-'}</span>
        <div class="actions">
          ${USGPageKit.statusBadge(item.status || 'idle')}
          <button class="ghost-btn" data-run-function="${item.id}" type="button">Run</button>
          <button class="danger-btn" data-delete-function="${item.id}" type="button">Delete</button>
        </div>
      </div>
    `).join('') : USGPageKit.emptyState({ title: 'No functions found' });

    content.appendChild(wrap);

    document.querySelectorAll('[data-run-function]').forEach(btn => {
      btn.onclick = async () => {
        USGIOSAlert.show({ title: 'Function Run', message: 'Run endpoint can be wired next.' });
      };
    });

    rows.forEach(item => {
      const delBtn = document.querySelector(`[data-delete-function="${item.id}"]`);
      if (delBtn) {
        delBtn.onclick = () => USGCrudKit.remove({
          title: 'Delete Function',
          message: 'Delete this function?',
          endpoint: `/api/functions/${item.id}`,
          onDone: () => loadFunctions()
        });
      }
    });
  } catch (error) {
    USGIOSAlert.show({ title: 'Functions Error', message: error.message, type: 'error' });
  }
}

loadFunctions();
