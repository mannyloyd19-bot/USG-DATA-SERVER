const Webhook = require('../models/webhook.model');

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
  const hooks = await Webhook.findAll({
    where: { event, isActive: true }
  });

  for (const hook of hooks) {
    sendWebhook(hook.url, {
      event,
      data,
      timestamp: new Date()
    });
  }
};
