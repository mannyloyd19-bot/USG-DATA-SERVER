const notifications = [];

function makeId() {
  return "ntf_" + Math.random().toString(36).slice(2, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function list() {
  return notifications.slice().reverse();
}

function unreadCount() {
  return notifications.filter(n => !n.read).length;
}

function create(payload = {}) {
  const item = {
    id: makeId(),
    title: payload.title || "Notification",
    message: payload.message || "",
    level: payload.level || "info",
    source: payload.source || "system",
    read: false,
    createdAt: nowIso()
  };
  notifications.push(item);
  return item;
}

function markRead(id) {
  const item = notifications.find(n => n.id === id);
  if (item) item.read = true;
  return item;
}

function markAllRead() {
  notifications.forEach(n => n.read = true);
}

function remove(id) {
  const i = notifications.findIndex(n => n.id === id);
  if (i !== -1) notifications.splice(i, 1);
}

module.exports = {
  list,
  unreadCount,
  create,
  markRead,
  markAllRead,
  remove
};
