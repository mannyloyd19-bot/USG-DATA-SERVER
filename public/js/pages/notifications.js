window.__DISABLE_HEALTH_BANNER__ = true;
requireAuth();
USGShell.buildShell();

let notificationRows = [];
let unreadCount = 0;

async function safeJson(url, options) {
  try {
    const res = await apiFetch(url, options || {});
    return await res.json();
  } catch {
    return {};
  }
}

function badge(level) {
  const v = String(level || "").toLowerCase();
  if (["success", "ok"].includes(v)) return USGPageKit.statusBadge("online");
  if (["warning", "warn"].includes(v)) return USGPageKit.statusBadge("warning");
  if (["error", "failed"].includes(v)) return USGPageKit.statusBadge("error");
  return USGPageKit.statusBadge("neutral");
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

function rowCard(item) {
  return `
    <div class="list-card">
      <strong>${item.title || "Notification"}</strong><br>
      <span class="muted">${item.message || "-"}</span><br>
      <span class="muted">Source: ${item.source || "system"}</span><br>
      <span class="muted">Time: ${item.createdAt || "-"}</span>
      <div class="actions" style="margin-top:10px">
        ${badge(item.level)}
        ${item.read ? USGPageKit.statusBadge("online") : USGPageKit.statusBadge("warning")}
        ${!item.read ? `<button class="ghost-btn" type="button" data-read-id="${item.id}">Mark Read</button>` : ""}
        <button class="danger-btn" type="button" data-delete-id="${item.id}">Delete</button>
      </div>
    </div>
  `;
}

async function loadNotifications() {
  const content = document.getElementById("page-content");
  if (!content) return;

  content.innerHTML = "";

  USGPageKit.setPageHeader({
    kicker: "OPERATIONS",
    title: "Notifications",
    subtitle: "Review alerts, system messages, and operator notices"
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
    </section>
  `;

  const loading = document.createElement("section");
  loading.className = "card";
  loading.style.marginTop = "18px";
  loading.innerHTML = `<div class="muted">Loading notifications...</div>`;
  content.appendChild(loading);

  const payload = await safeJson("/api/notifications");
  notificationRows = Array.isArray(payload.notifications) ? payload.notifications : [];
  unreadCount = Number(payload.unread || 0);

  loading.remove();

  content.innerHTML += `
    <div class="grid-3" style="margin-top:18px">
      ${infoCard("Total", notificationRows.length, "All notifications")}
      ${infoCard("Unread", unreadCount, "Unread alerts and notices")}
      ${infoCard("Sources", [...new Set(notificationRows.map(x => x.source || "system"))].length, "Active notification modules")}
    </div>
  `;

  content.innerHTML += `
    <section class="card" style="margin-top:18px">
      <div class="kicker">STREAM</div>
      <h2>Recent Notifications</h2>
      ${notificationRows.length ? notificationRows.map(rowCard).join("") : USGPageKit.emptyState({ title: "No notifications found" })}
    </section>
  `;

  document.getElementById("ntf-refresh-btn").onclick = () => loadNotifications();

  document.getElementById("ntf-seed-btn").onclick = async () => {
    await safeJson("/api/notifications/test-seed", { method: "POST" });
    USGIOSAlert.show({ title: "Notifications", message: "Test notification created." });
    loadNotifications();
  };

  document.getElementById("ntf-mark-all-btn").onclick = async () => {
    await safeJson("/api/notifications/mark-all-read", { method: "POST" });
    USGIOSAlert.show({ title: "Notifications", message: "All notifications marked as read." });
    loadNotifications();
  };

  notificationRows.forEach((item) => {
    const readBtn = document.querySelector('[data-read-id="' + item.id + '"]');
    const delBtn = document.querySelector('[data-delete-id="' + item.id + '"]');

    if (readBtn) {
      readBtn.onclick = async () => {
        await safeJson("/api/notifications/" + item.id + "/read", { method: "PATCH" });
        loadNotifications();
      };
    }

    if (delBtn) {
      delBtn.onclick = async () => {
        await safeJson("/api/notifications/" + item.id, { method: "DELETE" });
        loadNotifications();
      };
    }
  });
}

loadNotifications();
