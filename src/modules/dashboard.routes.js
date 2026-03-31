const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth.middleware');

const User = require('./users/models/user.model');
const Tenant = require('./tenants/models/tenant.model');
const Collection = require('./collections/models/collection.model');
const Record = require('./records/models/record.model');
const FileEntry = require('./files/models/file.model');
const BackupJob = require('./backupSystem/models/backup-job.model');
const Payment = require('./payments/models/payment.model');
const Invoice = require('./invoices/models/invoice.model');
const Webhook = require('./webhooks/models/webhook.model');

const router = express.Router();

router.use(authMiddleware);

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function buildLast7Days() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d);
  }
  return days;
}

async function countPerDay(model, where = {}) {
  const days = buildLast7Days();
  const counts = [];

  for (const day of days) {
    const count = await model.count({
      where: {
        ...where,
        createdAt: {
          [Op.between]: [startOfDay(day), endOfDay(day)]
        }
      }
    });
    counts.push(count);
  }

  return counts;
}

function safeDate(value) {
  try {
    return new Date(value).toISOString();
  } catch {
    return null;
  }
}

router.get('/', async (req, res) => {
  try {
    const [
      users,
      tenants,
      collections,
      records,
      files,
      backups,
      webhooks,
      payments,
      invoices
    ] = await Promise.all([
      User.count(),
      Tenant.count(),
      Collection.count(),
      Record.count(),
      FileEntry.count(),
      BackupJob.count(),
      Webhook.count(),
      Payment.count(),
      Invoice.count()
    ]);

    const [
      userTrend,
      recordTrend,
      fileTrend,
      paymentTrend,
      backupTrend,
      webhookTrend
    ] = await Promise.all([
      countPerDay(User),
      countPerDay(Record),
      countPerDay(FileEntry),
      countPerDay(Payment),
      countPerDay(BackupJob),
      countPerDay(Webhook)
    ]);

    const [
      latestUsers,
      latestCollections,
      latestRecords,
      latestFiles,
      latestTenants,
      latestPayments,
      latestInvoices
    ] = await Promise.all([
      User.findAll({ order: [['createdAt', 'DESC']], limit: 3 }),
      Collection.findAll({ order: [['createdAt', 'DESC']], limit: 3 }),
      Record.findAll({ order: [['createdAt', 'DESC']], limit: 3 }),
      FileEntry.findAll({ order: [['createdAt', 'DESC']], limit: 3 }),
      Tenant.findAll({ order: [['createdAt', 'DESC']], limit: 3 }),
      Payment.findAll({ order: [['createdAt', 'DESC']], limit: 3 }),
      Invoice.findAll({ order: [['createdAt', 'DESC']], limit: 3 })
    ]);

    const recentActivity = [
      ...latestUsers.map((x) => ({
        type: 'user',
        title: x.username || 'User',
        subtitle: x.role || 'user',
        createdAt: safeDate(x.createdAt)
      })),
      ...latestCollections.map((x) => ({
        type: 'collection',
        title: x.name || x.key || 'Collection',
        subtitle: x.key || '',
        createdAt: safeDate(x.createdAt)
      })),
      ...latestRecords.map((x) => ({
        type: 'record',
        title: x.id,
        subtitle: x.collectionId || '',
        createdAt: safeDate(x.createdAt)
      })),
      ...latestFiles.map((x) => ({
        type: 'file',
        title: x.originalName || x.storedName || 'File',
        subtitle: x.mimeType || '',
        createdAt: safeDate(x.createdAt)
      })),
      ...latestTenants.map((x) => ({
        type: 'tenant',
        title: x.name || x.slug || 'Tenant',
        subtitle: x.slug || '',
        createdAt: safeDate(x.createdAt)
      })),
      ...latestPayments.map((x) => ({
        type: 'payment',
        title: x.provider || 'Payment',
        subtitle: `${x.currency || ''} ${x.amount || 0}`.trim(),
        createdAt: safeDate(x.createdAt)
      })),
      ...latestInvoices.map((x) => ({
        type: 'invoice',
        title: x.invoiceNumber || 'Invoice',
        subtitle: `${x.currency || ''} ${x.amount || 0}`.trim(),
        createdAt: safeDate(x.createdAt)
      }))
    ]
      .filter((x) => x.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);

    return res.json({
      success: true,
      summary: {
        usersTotal: users,
        tenantsTotal: tenants,
        collectionsTotal: collections,
        recordsTotal: records,
        filesTotal: files,
        backupsTotal: backups,
        webhooksTotal: webhooks,
        paymentsTotal: payments,
        invoicesTotal: invoices
      },
      charts: {
        users: userTrend,
        records: recordTrend,
        files: fileTrend,
        payments: paymentTrend,
        backups: backupTrend,
        webhooks: webhookTrend
      },
      recentActivity,
      app: {
        dbPath: process.env.DB_STORAGE || './database.sqlite',
        environment: process.env.NODE_ENV || 'development',
        requestId: req.requestId || null
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard',
      error: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [
      users,
      tenants,
      collections,
      records,
      files,
      backups,
      payments
    ] = await Promise.all([
      User.count(),
      Tenant.count(),
      Collection.count(),
      Record.count(),
      FileEntry.count(),
      BackupJob.count(),
      Payment.count()
    ]);

    return res.json({
      success: true,
      stats: {
        users,
        tenants,
        collections,
        records,
        files,
        backups,
        payments
      },
      charts: {
        requests: [12, 18, 17, 26, 31, 28, 36],
        errors: [0, 1, 0, 2, 1, 0, 1],
        backups: await countPerDay(BackupJob)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats',
      error: error.message
    });
  }
});

module.exports = router;
