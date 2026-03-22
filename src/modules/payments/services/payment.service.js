const Payment = require('../models/payment.model');
const Invoice = require('../../invoices/models/invoice.model');

async function createPayment({
  tenantId,
  invoiceId = null,
  provider = 'manual',
  referenceCode = null,
  amount,
  currency = 'PHP',
  metadata = {}
}) {
  return Payment.create({
    tenantId: String(tenantId),
    invoiceId: invoiceId || null,
    provider,
    referenceCode,
    amount: Number(amount || 0),
    currency,
    status: 'pending',
    metadataJson: JSON.stringify(metadata || {})
  });
}

async function markPaymentPaid(paymentId) {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) throw new Error('Payment not found');

  payment.status = 'paid';
  payment.paidAt = new Date();
  await payment.save();

  if (payment.invoiceId) {
    const invoice = await Invoice.findByPk(payment.invoiceId);
    if (invoice) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      await invoice.save();
    }
  }

  return payment;
}

async function markPaymentFailed(paymentId) {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) throw new Error('Payment not found');

  payment.status = 'failed';
  await payment.save();
  return payment;
}

module.exports = {
  createPayment,
  markPaymentPaid,
  markPaymentFailed
};
