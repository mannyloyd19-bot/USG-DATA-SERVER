const Payment = require('../../payments/models/payment.model');
const Invoice = require('../../invoices/models/invoice.model');
const { createGatewayCheckout, resolveWebhookEvent } = require('../services/payment-gateway.service');

exports.createCheckout = async (req, res) => {
  try {
    const { paymentId, provider } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'paymentId is required' });
    }

    const checkout = await createGatewayCheckout({ paymentId, provider });
    return res.json({ success: true, checkout });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.receiveWebhook = async (req, res) => {
  try {
    const provider = req.params.provider;
    const payload = req.body || {};

    const event = await resolveWebhookEvent({ provider, payload });

    if (event.paymentId) {
      const payment = await Payment.findByPk(event.paymentId);
      if (payment) {
        payment.provider = event.provider || payment.provider;
        if (event.referenceCode) payment.referenceCode = event.referenceCode;
        payment.status = event.status === 'paid' ? 'paid' : payment.status;
        if (event.status === 'paid') payment.paidAt = new Date();
        payment.metadataJson = JSON.stringify({
          webhookEventType: event.eventType,
          externalId: event.externalId,
          raw: event.raw
        });
        await payment.save();

        if (payment.invoiceId) {
          const invoice = await Invoice.findByPk(payment.invoiceId);
          if (invoice && event.status === 'paid') {
            invoice.status = 'paid';
            invoice.paidAt = new Date();
            await invoice.save();
          }
        }
      }
    }

    return res.json({
      success: true,
      received: {
        provider: event.provider,
        eventType: event.eventType,
        paymentId: event.paymentId,
        invoiceId: event.invoiceId,
        status: event.status
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.health = async (req, res) => {
  return res.json({
    success: true,
    gateways: [
      { key: 'manual', enabled: true },
      { key: 'stripe', enabled: true },
      { key: 'paymongo', enabled: true },
      { key: 'paypal', enabled: true }
    ]
  });
};
