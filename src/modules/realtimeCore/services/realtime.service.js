const WebSocket = require('ws');

let wss = null;
const clients = new Set();

function init(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.send(JSON.stringify({
      type: 'system.connected',
      message: 'Realtime connected'
    }));
  });

  console.log('[Realtime] WebSocket server started');
}

function pushEvent(event) {
  if (!wss) return;

  const payload = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

module.exports = {
  init,
  pushEvent
};
