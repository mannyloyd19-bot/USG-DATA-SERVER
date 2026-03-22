const Webhook = require('../../webhooks/models/webhook.model');
const WebhookDelivery = require('../models/webhook-delivery.model');
const { deliverWebhook, retryDelivery } = require('../services/webhook-delivery.service');

exports.listDeliveries = async (req, res) => {
  try {
    const rows = await WebhookDelivery.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ success: true, deliveries: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.testWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findByPk(req.params.id);
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }

    const delivery = await deliverWebhook(webhook, {
      type: 'manual.test',
      module: 'webhooks',
      action: 'test',
      data: { source: 'manual' }
    });

    return res.json({ success: true, delivery });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.retryOne = async (req, res) => {
  try {
    const delivery = await WebhookDelivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const retried = await retryDelivery(delivery);
    return res.json({ success: true, delivery: retried });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
