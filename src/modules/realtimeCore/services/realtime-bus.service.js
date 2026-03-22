const clients = new Set();
const recentEvents = [];

function pushRecent(event) {
  recentEvents.unshift({
    ...event,
    emittedAt: new Date().toISOString()
  });
  if (recentEvents.length > 100) recentEvents.pop();
}

function emitEvent(event) {
  const payload = {
    ...event,
    emittedAt: new Date().toISOString()
  };

  pushRecent(event);

  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) {
    try {
      client.write(data);
    } catch {}
  }
}

function addClient(res) {
  clients.add(res);
}

function removeClient(res) {
  clients.delete(res);
}

function getRecentEvents() {
  return recentEvents;
}

module.exports = {
  emitEvent,
  addClient,
  removeClient,
  getRecentEvents
};
