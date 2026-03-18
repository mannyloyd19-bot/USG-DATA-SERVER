const clients = new Set();

exports.addClient = (res) => {
  clients.add(res);
};

exports.removeClient = (res) => {
  clients.delete(res);
};

exports.broadcast = (event, payload) => {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const client of clients) {
    try {
      client.write(message);
    } catch (error) {
      clients.delete(client);
    }
  }
};

exports.clientCount = () => clients.size;
