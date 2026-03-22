const Invoice = require('../models/invoice.model');

function buildInvoiceNumber() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${y}${m}${day}-${rand}`;
}

async function createInvoice({
  tenantId,
  planKey,
  amount,
  currency = 'PHP',
  dueDate = null,
  items = [],
  notes = null
}) {
  return Invoice.create({
    tenantId: String(tenantId),
    invoiceNumber: buildInvoiceNumber(),
    planKey: planKey || null,
    amount: Number(amount || 0),
    currency,
    status: 'issued',
    dueDate: dueDate || null,
    issuedAt: new Date(),
    itemsJson: JSON.stringify(items || []),
    notes: notes || null
  });
}

module.exports = {
  createInvoice
};
