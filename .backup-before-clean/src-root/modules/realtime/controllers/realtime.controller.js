const realtimeService = require('../services/realtime.service');

exports.stream = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
  });

  res.write(`event: connected\ndata: ${JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    tenantId: req.tenantContext?.tenantId || null,
    tenantSlug: req.tenantContext?.tenantSlug || null
  })}\n\n`);

  realtimeService.addClient(res, {
    tenantId: req.tenantContext?.tenantId || null,
    tenantSlug: req.tenantContext?.tenantSlug || null
  });

  req.on('close', () => {
    realtimeService.removeClient(res);
  });
};

exports.status = async (req, res) => {
  return res.json({
    success: true,
    clients: realtimeService.clientCount()
  });
};
