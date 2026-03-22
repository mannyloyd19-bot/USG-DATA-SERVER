const Invoice = require('../models/invoice.model');
const { createInvoice } = require('../services/invoice.service');

function safeParse(v, fallback = []) {
  try { return JSON.parse(v); } catch { return fallback; }
}

exports.list = async (req, res) => {
  try {
    const rows = await Invoice.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({
      success: true,
      invoices: rows.map(r => {
        const j = r.toJSON();
        return { ...j, itemsJson: safeParse(j.itemsJson, []) };
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
      planKey,
      amount,
      currency,
      dueDate,
      items,
      notes
    } = req.body || {};

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'tenantId is required' });
    }

    const invoice = await createInvoice({
      tenantId,
      planKey,
      amount,
      currency,
      dueDate,
      items,
      notes
    });

    return res.json({ success: true, invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.details = async (req, res) => {
  try {
    const row = await Invoice.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const j = row.toJSON();
    return res.json({
      success: true,
      invoice: { ...j, itemsJson: safeParse(j.itemsJson, []) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const row = await Invoice.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    row.status = 'paid';
    row.paidAt = new Date();
    await row.save();

    return res.json({ success: true, invoice: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
