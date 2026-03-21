const clients = new Set();

exports.addClient = (res, meta = {}) => {
  const client = {
    res,
    tenantId: meta.tenantId || null,
    tenantSlug: meta.tenantSlug || null
  };
  clients.add(client);
  return client;
};

exports.removeClient = (res) => {
  for (const client of clients) {
    if (client.res === res) {
      clients.delete(client);
      break;
    }
  }
};

exports.broadcast = (event, payload = {}, options = {}) => {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const client of clients) {
    try {
      const tenantMatches =
        (!options.tenantId || client.tenantId === options.tenantId) &&
        (!options.tenantSlug || client.tenantSlug === options.tenantSlug);

      if (!tenantMatches) continue;

      client.res.write(message);
    } catch (error) {
      clients.delete(client);
    }
  }
};

exports.clientCount = () => clients.size;
