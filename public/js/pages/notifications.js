window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

let notificationRows = [];
let unreadCount = 0;
let searchQuery = '';
let levelFilter = '';
let unreadOnly = false;

async function safeJson(url, options) {
  try {
    const res = await apiFetch(url, options || {});
    return await res.json();
  } catch {
    return {};
  }
}

function badge(level) {
  const v = String(level || '').toLowerCase();
  if (['success', 'ok'].includes(v)) return USGPageKit.statusBadge('online');
  if (['warning', 'warn'].includes(v)) return USGPageKit.statusBadge('warning');
  if (['error', 'failed', 'critical'].includes(v)) return USGPageKit.statusBadge('error');
  return USGPageKit.statusBadge('neutral');
}

function infoCard(title, value, desc) {
  return `
    <section class="card">
      <div class="kicker">NOTIFICATIONS</div>
      <h2>${title}</h2>
      <div class="info-value" style="font-size:28px;font-weight:800">${value}</div>
      <div class="muted">${desc}</div>
    </section>
  `;
}

function getRelatedLink(source) {
  const s = String(source || '').toLowerCase();
  if (s.includes('backup')) return '/pages/backup-monitor.html';
  if (s.includes('queue')) return '/pages/queue-monitor.html';
  if (s.includes('diagnostic')) return '/pages/diagnostics-console.html';
  if (s.includes('domain')) return '/pages/domain-diagnostics.html';
  if (s.includes('notification')) return '/pages/notifications.html';
  return '';
}

function applyFilters(rows) {
  return rows.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const hay = [
      item?.title || '',
      item?.message || '',
      item?.source || '',
      item?.level || ''
    ].join(' ').toLowerCase();

    if (q && !hay.includes(q)) return false;
    if (levelFilter && String(item?.level || '').toLowerCase() !== levelFilter) return false;
    if (unreadOnly && item?.read) return false;
    return true;
  });
}

function rowCard(item) {
  const related = getRelatedLink(item.source);
  return `
    <div class="list-card">
      <strong>${item.title || 'Notification'}</strong><br>
      <span class="muted">${item.message || '-'}</span><br>
      <span class="muted">Source: ${item.source || 'system'}</span><br>
      <span class="muted">Time: ${item.createdAt || '-'}</span>

      <div class="actions" style="margin-top:10px;flex-wrap:wrap">
        ${badge(item.level)}
        ${item.read ? USGPageKit.statusBadge('online') : USGPageKit.statusBadge('warning')}
        ${!item.read ? `<button class="ghost-btn" type="button" data-read-id="${item.id}">Mark Read</button>` : ''}
        ${related ? `<a class="ghost-btn" href="${related}">Open Related</a>` : ''}
        <button class="danger-btn" type="button" data-delete-id="${item.id}">Delete</button>
      </div>
    </div>
  `;
}

function bindActions(rows) {
  rows.forEach((item) => {
    const readBtn = document.querySelector('[data-read-id="' + item.id + '"]');
    const delBtn = document.querySelector('[data-delete-id="' + item.id + '"]');

    if (readBtn) {
      readBtn.onclick = async () => {
        await safeJson('/api/notifications/' + item.id + '/read', { method: 'PATCH' });
        await loadNotifications();
      };
    }

    if (delBtn) {
      delBtn.onclick = async () => {
        await safeJson('/api/notifications/' + item.id, { method: 'DELETE' });
        await loadNotifications();
      };
    }
  });
}

async function loadNotifications() {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = '';

  USGPageKit.setPageHeader({
    kicker: 'OPERATIONS',
    title: 'Notifications',
    subtitle: 'Review alerts, system messages, and operator notices'
  });

  content.innerHTML += `
    <section class="card">
      <div class="usg-page-head-row">
        <div>
          <div class="kicker">ACTIONS</div>
          <h2>Notification Controls</h2>
        </div>
        <div class="actions">
          <button id="ntf-refresh-btn" class="ghost-btn" type="button">Refresh</button>
          <button id="ntf-seed-btn" class="ghost-btn" type="button">Test Notification</button>
          <button id="ntf-mark-all-btn" class="primary-btn" type="button">Mark All Read</button>
        </div>
      </div>

      <div class="grid-3" style="margin-top:18px">
        <div>
          <label class="muted">Search</label>
          <input id="ntf-search" placeholder="Search title, message, source" value="${searchQuery.replaceAll('"', '&quot;')}" style="width:100%;margin-top:6px">
        </div>
        <div>
          <label class="muted">Level</label>
          <select id="ntf-level" style="width:100%;margin-top:6px">
            <option value="">All levels</option>
            <option value="info" ${levelFilter === 'info' ? 'selected' : ''}>Info</option>
            <option value="success" ${levelFilter === 'success' ? 'selected' : ''}>Success</option>
            <option value="warning" ${levelFilter === 'warning' ? 'selected' : ''}>Warning</option>
            <option value="warn" ${levelFilter === 'warn' ? 'selected' : ''}>Warn</option>
            <option value="error" ${levelFilter === 'error' ? 'selected' : ''}>Error</option>
            <option value="critical" ${levelFilter === 'critical' ? 'selected' : ''}>Critical</option>
          </select>
        </div>
        <div>
          <label class="muted">Unread Only</label>
          <select id="ntf-unread-only" style="width:100%;margin-top:6px">
            <option value="false" ${!unreadOnly ? 'selected' : ''}>No</option>
            <option value="true" ${unreadOnly ? 'selected' : ''}>Yes</option>
          </select>
        </div>
      </div>
    </section>
  `;

  const loading = document.createElement('section');
  loading.className = 'card';
  loading.style.marginTop = '18px';
  loading.innerHTML = `<div class="muted">Loading notifications...</div>`;
  content.appendChild(loading);

  const payload = await safeJson('/api/notifications');
  notificationRows = Array.isArray(payload.notifications) ? payload.notifications : [];
  unreadCount = Number(payload.unread || 0);

  loading.remove();

  const filtered = applyFilters(notificationRows);
  const sourceCount = new Set(notificationRows.map(x => x.source || 'system')).size;

  content.innerHTML += `
    <div class="grid-3" style="margin-top:18px">
      ${infoCard('Total', notificationRows.length, 'All notifications')}
      ${infoCard('Unread', unreadCount, 'Unread alerts and notices')}
      ${infoCard('Sources', sourceCount, 'Active notification modules')}
    </div>
  `;

  content.innerHTML += `
    <section class="card" style="margin-top:18px">
      <div class="kicker">STREAM</div>
      <h2>Recent Notifications</h2>
      ${filtered.length ? filtered.map(rowCard).join('') : USGPageKit.emptyState({ title: 'No notifications match current filters' })}
    </section>
  `;

  document.getElementById('ntf-refresh-btn').onclick = () => loadNotifications();

  document.getElementById('ntf-seed-btn').onclick = async () => {
    await safeJson('/api/notifications/test-seed', { method: 'POST' });
    USGIOSAlert.show({ title: 'Notifications', message: 'Test notification created.' });
    await loadNotifications();
  };

  document.getElementById('ntf-mark-all-btn').onclick = async () => {
    await safeJson('/api/notifications/mark-all-read', { method: 'POST' });
    USGIOSAlert.show({ title: 'Notifications', message: 'All notifications marked as read.' });
    await loadNotifications();
  };

  document.getElementById('ntf-search').oninput = async (e) => {
    searchQuery = String(e.target.value || '');
    await loadNotifications();
  };

  document.getElementById('ntf-level').onchange = async (e) => {
    levelFilter = String(e.target.value || '').toLowerCase();
    await loadNotifications();
  };

  document.getElementById('ntf-unread-only').onchange = async (e) => {
    unreadOnly = String(e.target.value || 'false') === 'true';
    await loadNotifications();
  };

  bindActions(filtered);
}

loadNotifications();
