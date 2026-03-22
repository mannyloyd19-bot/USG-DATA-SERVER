const Webhook = require('../../webhooks/models/webhook.model');
const WebhookDelivery = require('../models/webhook-delivery.model');

async function safeReadText(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

async function deliverWebhook(webhook, eventPayload) {
  const payload = {
    event: eventPayload.type || eventPayload.eventType || 'system.event',
    module: eventPayload.module || 'system',
    action: eventPayload.action || 'emit',
    recordId: eventPayload.recordId || null,
    data: eventPayload.data || {},
    emittedAt: new Date().toISOString()
  };

  const delivery = await WebhookDelivery.create({
    webhookId: webhook.id || null,
    eventType: payload.event,
    targetUrl: webhook.url || webhook.endpoint,
    requestBody: JSON.stringify(payload),
    deliveryStatus: 'pending',
    retryCount: 0
  });

  try {
    const res = await fetch(webhook.url || webhook.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhook.secret ? { 'x-webhook-secret': webhook.secret } : {})
      },
      body: JSON.stringify(payload)
    });

    const body = await safeReadText(res);

    delivery.responseStatus = res.status;
    delivery.responseBody = body;
    delivery.deliveryStatus = res.ok ? 'success' : 'failed';
    delivery.lastError = res.ok ? null : `HTTP ${res.status}`;
    await delivery.save();

    return delivery;
  } catch (error) {
    delivery.deliveryStatus = 'failed';
    delivery.lastError = error.message;
    await delivery.save();
    return delivery;
  }
}

async function retryDelivery(delivery) {
  const webhook = await Webhook.findByPk(delivery.webhookId);
  if (!webhook) {
    delivery.deliveryStatus = 'failed';
    delivery.lastError = 'Webhook not found';
    await delivery.save();
    return delivery;
  }

  const payload = JSON.parse(delivery.requestBody || '{}');

  try {
    const res = await fetch(webhook.url || webhook.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhook.secret ? { 'x-webhook-secret': webhook.secret } : {})
      },
      body: JSON.stringify(payload)
    });

    const body = await safeReadText(res);

    delivery.retryCount = (delivery.retryCount || 0) + 1;
    delivery.responseStatus = res.status;
    delivery.responseBody = body;
    delivery.deliveryStatus = res.ok ? 'success' : 'failed';
    delivery.lastError = res.ok ? null : `HTTP ${res.status}`;
    await delivery.save();

    return delivery;
  } catch (error) {
    delivery.retryCount = (delivery.retryCount || 0) + 1;
    delivery.deliveryStatus = 'failed';
    delivery.lastError = error.message;
    await delivery.save();
    return delivery;
  }
}

async function deliverToMatchingWebhooks(eventPayload) {
  const rows = await Webhook.findAll().catch(() => []);
  const active = rows.filter(w => {
    const status = String(w.status || 'active').toLowerCase();
    return status === 'active';
  });

  const deliveries = [];
  for (const webhook of active) {
    const ev = String(webhook.event || webhook.name || '').toLowerCase();
    const incoming = String(eventPayload.type || '').toLowerCase();
    if (!ev || ev === incoming || ev === 'all' || ev === '*') {
      deliveries.push(await deliverWebhook(webhook, eventPayload));
    }
  }
  return deliveries;
}

module.exports = {
  deliverWebhook,
  retryDelivery,
  deliverToMatchingWebhooks
};
