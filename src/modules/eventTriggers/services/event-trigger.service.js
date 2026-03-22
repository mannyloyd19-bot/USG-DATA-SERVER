const { emitEvent } = require('../../realtimeCore/services/realtime-bus.service');

let deliverToMatchingWebhooks = async () => [];
try {
  ({ deliverToMatchingWebhooks } = require('../../webhookAdvanced/services/webhook-delivery.service'));
} catch {}

async function emitCrudEvent({ module, action, recordId, data }) {
  const payload = {
    type: `${module}.${action}`,
    module,
    action,
    recordId: recordId || null,
    data: data || {}
  };

  emitEvent(payload);

  try {
    await deliverToMatchingWebhooks(payload);
  } catch (error) {
    console.error('[webhookDelivery] error:', error.message);
  }
}

module.exports = {
  emitCrudEvent
};
