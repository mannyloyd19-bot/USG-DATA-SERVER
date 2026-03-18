const Webhook = require('../models/webhook.model');
const realtimeService = require('../../realtime/services/realtime.service');
const functionService = require('../../functions/services/function.service');

async function sendWebhook(url, payload) {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
}

exports.trigger = async (event, data) => {
  const payload = {
    event,
    data,
    timestamp: new Date().toISOString()
  };

  realtimeService.broadcast('activity', payload);
  realtimeService.broadcast(event, payload);

  await functionService.runFunctions(event, payload);

  const hooks = await Webhook.findAll({
    where: { event, isActive: true }
  });

  for (const hook of hooks) {
    sendWebhook(hook.url, payload);
  }
};
