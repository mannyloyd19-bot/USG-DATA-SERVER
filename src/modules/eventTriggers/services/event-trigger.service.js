const { pushEvent } = require('../../realtimeCore/services/realtime.service');
const webhookService = require('../../webhookAdvanced/services/webhook.service');
const auditService = require('../../audit/services/audit.service');

async function emitCrudEvent({ module, action, recordId, data, req = null }) {
  const event = {
    type: `crud.${action}`,
    module,
    action,
    recordId,
    data,
    emittedAt: new Date().toISOString()
  };

  try {
    // 1. realtime
    pushEvent(event);

    // 2. webhook
    await webhookService.dispatch(event);

    // 3. audit
    if (req) {
      await auditService.writeLog({
        req,
        module,
        action,
        entityType: module,
        entityId: recordId,
        status: 'success',
        afterData: data
      });
    }

  } catch (err) {
    console.error('[emitCrudEvent] failed:', err.message);
  }
}

module.exports = {
  emitCrudEvent
};
