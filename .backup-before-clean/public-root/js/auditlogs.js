requireAuth();

const auditList = document.getElementById('audit-list');
const auditForm = document.getElementById('audit-form');

async function loadAuditLogs() {
  auditList.innerHTML = '<div class="muted">Loading audit logs...</div>';

  const params = new URLSearchParams();
  const moduleValue = document.getElementById('audit-module').value.trim();
  const actionValue = document.getElementById('audit-action').value.trim();
  const statusValue = document.getElementById('audit-status').value.trim();
  const limitValue = document.getElementById('audit-limit').value.trim() || '20';

  if (moduleValue) params.set('module', moduleValue);
  if (actionValue) params.set('action', actionValue);
  if (statusValue) params.set('status', statusValue);
  params.set('limit', limitValue);

  try {
    const res = await apiFetch(`/api/audit-logs?${params.toString()}`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      auditList.innerHTML = '<div class="muted">No audit logs found.</div>';
      return;
    }

    auditList.innerHTML = data.items.map(item => `
      <div class="item-card">
        <div><strong>${item.module}.${item.action}</strong></div>
        <div class="muted">${item.status} · ${item.username || 'system'}</div>
        <div class="muted">${new Date(item.createdAt).toLocaleString()}</div>
        <div style="margin-top:8px">${item.message || ''}</div>
      </div>
    `).join('');
  } catch (error) {
    auditList.innerHTML = `<div class="muted">${error.message}</div>`;
  }
}

auditForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loadAuditLogs();
});

loadAuditLogs();
