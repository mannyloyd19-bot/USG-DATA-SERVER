const bus = require('../services/realtime-bus.service');

exports.stream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: 'connected', emittedAt: new Date().toISOString() })}\n\n`);

  bus.addClient(res);

  req.on('close', () => {
    bus.removeClient(res);
    res.end();
  });
};

exports.recent = async (req, res) => {
  return res.json({
    success: true,
    events: bus.getRecentEvents()
  });
};

exports.testEmit = async (req, res) => {
  const payload = req.body || {};
  bus.emitEvent({
    type: payload.type || 'manual.test',
    module: payload.module || 'system',
    action: payload.action || 'emit',
    recordId: payload.recordId || null,
    data: payload.data || {}
  });

  return res.json({ success: true });
};
