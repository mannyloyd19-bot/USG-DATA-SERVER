const Payment = require('../models/payment.model');
const { createPayment, markPaymentPaid, markPaymentFailed } = require('../services/payment.service');

function safeParse(v, fallback = {}) {
  try { return JSON.parse(v); } catch { return fallback; }
}

exports.list = async (req, res) => {
  try {
    const rows = await Payment.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({
      success: true,
      payments: rows.map(r => {
        const j = r.toJSON();
        return { ...j, metadataJson: safeParse(j.metadataJson, {}) };
      })
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      tenantId,
      invoiceId,
      provider,
      referenceCode,
      amount,
      currency,
      metadata
    } = req.body || {};

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'tenantId is required' });
    }

    const payment = await createPayment({
      tenantId,
      invoiceId,
      provider,
      referenceCode,
      amount,
      currency,
      metadata
    });

    return res.json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const payment = await markPaymentPaid(req.params.id);
    return res.json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markFailed = async (req, res) => {
  try {
    const payment = await markPaymentFailed(req.params.id);
    return res.json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
