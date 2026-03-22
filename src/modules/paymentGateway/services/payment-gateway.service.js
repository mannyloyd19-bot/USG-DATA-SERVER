const Payment = require('../../payments/models/payment.model');
const Invoice = require('../../invoices/models/invoice.model');

function getBaseUrl() {
  return process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL || 'http://localhost:3000';
}

function safeString(v, fallback = '') {
  return v === undefined || v === null ? fallback : String(v);
}

async function createManualCheckout({ payment }) {
  return {
    provider: 'manual',
    mode: 'manual',
    checkoutUrl: `${getBaseUrl()}/pages/payments.html?paymentId=${payment.id}`,
    externalId: null,
    raw: {
      message: 'Manual payment flow created'
    }
  };
}

async function createStripeCheckout({ payment, invoice, metadata = {} }) {
  return {
    provider: 'stripe',
    mode: 'checkout',
    checkoutUrl: `${getBaseUrl()}/pages/payments.html?provider=stripe&paymentId=${payment.id}`,
    externalId: `stripe_session_${payment.id}`,
    raw: {
      note: 'Replace with real Stripe Checkout Session API call',
      amount: payment.amount,
      currency: payment.currency,
      invoiceNumber: invoice?.invoiceNumber || null,
      metadata
    }
  };
}

async function createPayMongoCheckout({ payment, invoice, metadata = {} }) {
  return {
    provider: 'paymongo',
    mode: 'checkout',
    checkoutUrl: `${getBaseUrl()}/pages/payments.html?provider=paymongo&paymentId=${payment.id}`,
    externalId: `paymongo_link_${payment.id}`,
    raw: {
      note: 'Replace with real PayMongo checkout link/session API call',
      amount: payment.amount,
      currency: payment.currency,
      invoiceNumber: invoice?.invoiceNumber || null,
      metadata
    }
  };
}

async function createPayPalCheckout({ payment, invoice, metadata = {} }) {
  return {
    provider: 'paypal',
    mode: 'checkout',
    checkoutUrl: `${getBaseUrl()}/pages/payments.html?provider=paypal&paymentId=${payment.id}`,
    externalId: `paypal_order_${payment.id}`,
    raw: {
      note: 'Replace with real PayPal order creation API call',
      amount: payment.amount,
      currency: payment.currency,
      invoiceNumber: invoice?.invoiceNumber || null,
      metadata
    }
  };
}

async function createGatewayCheckout({ provider, paymentId }) {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  const invoice = payment.invoiceId ? await Invoice.findByPk(payment.invoiceId) : null;
  const metadata = {
    paymentId: payment.id,
    invoiceId: payment.invoiceId || null,
    tenantId: payment.tenantId
  };

  switch (safeString(provider, payment.provider || 'manual').toLowerCase()) {
    case 'stripe':
      return createStripeCheckout({ payment, invoice, metadata });
    case 'paymongo':
      return createPayMongoCheckout({ payment, invoice, metadata });
    case 'paypal':
      return createPayPalCheckout({ payment, invoice, metadata });
    case 'manual':
    default:
      return createManualCheckout({ payment, invoice, metadata });
  }
}

async function resolveWebhookEvent({ provider, payload }) {
  const p = safeString(provider).toLowerCase();

  if (p === 'stripe') {
    return {
      provider: 'stripe',
      eventType: payload?.type || 'stripe.unknown',
      externalId: payload?.data?.object?.id || null,
      referenceCode: payload?.data?.object?.payment_intent || null,
      paymentId: payload?.data?.object?.metadata?.paymentId || null,
      invoiceId: payload?.data?.object?.metadata?.invoiceId || null,
      status: payload?.type === 'checkout.session.completed' ? 'paid' : 'pending',
      raw: payload
    };
  }

  if (p === 'paymongo') {
    return {
      provider: 'paymongo',
      eventType: payload?.data?.attributes?.type || payload?.type || 'paymongo.unknown',
      externalId: payload?.data?.id || null,
      referenceCode: payload?.data?.attributes?.reference_number || null,
      paymentId: payload?.data?.attributes?.metadata?.paymentId || null,
      invoiceId: payload?.data?.attributes?.metadata?.invoiceId || null,
      status: 'paid',
      raw: payload
    };
  }

  if (p === 'paypal') {
    return {
      provider: 'paypal',
      eventType: payload?.event_type || 'paypal.unknown',
      externalId: payload?.resource?.id || null,
      referenceCode: payload?.resource?.invoice_id || null,
      paymentId: payload?.resource?.custom_id || null,
      invoiceId: payload?.resource?.invoice_id || null,
      status: 'paid',
      raw: payload
    };
  }

  return {
    provider: p || 'unknown',
    eventType: payload?.type || 'unknown',
    externalId: null,
    referenceCode: null,
    paymentId: payload?.paymentId || null,
    invoiceId: payload?.invoiceId || null,
    status: payload?.status || 'pending',
    raw: payload
  };
}

module.exports = {
  createGatewayCheckout,
  resolveWebhookEvent
};
