const { emitEvent } = require('../../realtimeCore/services/realtime-bus.service');

let deliverToMatchingWebhooks = async () => [];
try {
  ({ deliverToMatchingWebhooks } = require('../../webhookAdvanced/services/webhook-delivery.service'));
} catch {}

let auditService = null;
try {
  auditService = require('../../audit/services/audit.service');
} catch {}

async function emitCrudEvent({ module, action, recordId, data, req = null }) {
  const event = {
    type: `crud.${action}`,
    module,
    action,
    recordId: recordId || null,
    data: data || {},
    emittedAt: new Date().toISOString()
  };

  try {
    emitEvent(event);

    try {
      await deliverToMatchingWebhooks(event);
    } catch (error) {
      console.error('[emitCrudEvent:webhooks] failed:', error.message);
    }

    if (req && auditService && typeof auditService.writeLog === 'function') {
      try {
        await auditService.writeLog({
          req,
          user: req.user || null,
          module,
          action,
          entityType: module,
          entityId: recordId,
          status: 'success',
          afterData: data || null
        });
      } catch (error) {
        console.error('[emitCrudEvent:audit] failed:', error.message);
      }
    }
  } catch (err) {
    console.error('[emitCrudEvent] failed:', err.message);
  }
}

module.exports = {
  emitCrudEvent
};
