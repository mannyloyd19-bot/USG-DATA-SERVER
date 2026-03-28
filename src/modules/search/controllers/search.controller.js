const User = require('../../users/models/user.model');
const Tenant = require('../../tenants/models/tenant.model');
const Collection = require('../../collections/models/collection.model');
const Record = require('../../records/models/record.model');
const FileEntry = require('../../files/models/file.model');
const Webhook = require('../../webhooks/models/webhook.model');

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function includesText(value, q) {
  return normalize(value).includes(q);
}

function safeJsonText(value) {
  try {
    return JSON.stringify(value || {});
  } catch {
    return '';
  }
}

async function searchUsers(q, limitPerType) {
  const rows = await User.findAll({ order: [['createdAt', 'DESC']], limit: 50 });
  return rows
    .filter((x) =>
      includesText(x.username, q) ||
      includesText(x.role, q)
    )
    .slice(0, limitPerType)
    .map((x) => ({
      type: 'user',
      id: x.id,
      name: x.username,
      subtitle: x.role || ''
    }));
}

async function searchTenants(q, limitPerType) {
  const rows = await Tenant.findAll({ order: [['createdAt', 'DESC']], limit: 50 });
  return rows
    .filter((x) =>
      includesText(x.name, q) ||
      includesText(x.slug, q) ||
      includesText(x.status, q)
    )
    .slice(0, limitPerType)
    .map((x) => ({
      type: 'tenant',
      id: x.id,
      name: x.name || x.slug,
      subtitle: x.slug || ''
    }));
}

async function searchCollections(q, limitPerType) {
  const rows = await Collection.findAll({ order: [['createdAt', 'DESC']], limit: 50 });
  return rows
    .filter((x) =>
      includesText(x.name, q) ||
      includesText(x.key, q) ||
      includesText(x.description, q)
    )
    .slice(0, limitPerType)
    .map((x) => ({
      type: 'collection',
      id: x.id,
      name: x.name || x.key,
      subtitle: x.key || ''
    }));
}

async function searchRecords(q, limitPerType) {
  const rows = await Record.findAll({ order: [['createdAt', 'DESC']], limit: 100 });
  return rows
    .filter((x) => includesText(safeJsonText(x.data), q) || includesText(x.id, q))
    .slice(0, limitPerType)
    .map((x) => ({
      type: 'record',
      id: x.id,
      name: x.id,
      subtitle: x.collectionId || ''
    }));
}

async function searchFiles(q, limitPerType) {
  const rows = await FileEntry.findAll({ order: [['createdAt', 'DESC']], limit: 100 });
  return rows
    .filter((x) =>
      includesText(x.originalName, q) ||
      includesText(x.storedName, q) ||
      includesText(x.mimeType, q)
    )
    .slice(0, limitPerType)
    .map((x) => ({
      type: 'file',
      id: x.id,
      name: x.originalName || x.storedName,
      subtitle: x.mimeType || ''
    }));
}

async function searchWebhooks(q, limitPerType) {
  const rows = await Webhook.findAll({ order: [['createdAt', 'DESC']], limit: 50 });
  return rows
    .filter((x) =>
      includesText(x.name, q) ||
      includesText(x.event, q) ||
      includesText(x.url, q)
    )
    .slice(0, limitPerType)
    .map((x) => ({
      type: 'webhook',
      id: x.id,
      name: x.name || x.event,
      subtitle: x.event || ''
    }));
}

exports.globalSearch = async (req, res) => {
  const q = normalize(req.query.q || '');
  const limitPerType = Math.max(Number(req.query.limitPerType || 5), 1);

  if (!q) {
    return res.json({ success: true, query: '', count: 0, results: [] });
  }

  try {
    const groups = await Promise.all([
      searchUsers(q, limitPerType),
      searchTenants(q, limitPerType),
      searchCollections(q, limitPerType),
      searchRecords(q, limitPerType),
      searchFiles(q, limitPerType),
      searchWebhooks(q, limitPerType)
    ]);

    const results = groups.flat();

    return res.json({
      success: true,
      query: q,
      count: results.length,
      results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Global search failed',
      error: error.message
    });
  }
};
