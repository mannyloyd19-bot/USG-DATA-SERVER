const { Op } = require('sequelize');
const User = require('../../users/models/user.model');
const Collection = require('../../collections/models/collection.model');
const Record = require('../../records/models/record.model');
const FileEntry = require('../../files/models/file.model');
const Tenant = require('../../tenants/models/tenant.model');

function asText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function includesQuery(value, q) {
  return asText(value).toLowerCase().includes(q);
}

function clip(value, max = 140) {
  const text = asText(value).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + '...';
}

function scoreText(value, q) {
  const text = asText(value).toLowerCase();
  if (!text) return 0;
  if (text === q) return 120;
  if (text.startsWith(q)) return 80;
  if (text.includes(q)) return 40;
  return 0;
}

function scoreMany(q, parts) {
  return parts.reduce((sum, part) => sum + scoreText(part, q), 0);
}

async function searchUsers(q, limitPerType) {
  const rows = await User.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.like]: `%${q}%` } },
        { role: { [Op.like]: `%${q}%` } }
      ]
    },
    limit: limitPerType,
    order: [['updatedAt', 'DESC']]
  });

  return rows.map(row => ({
    type: 'user',
    id: row.id,
    name: row.username,
    subtitle: row.role || 'user',
    link: '/pages/users.html',
    score: scoreMany(q, [row.username, row.role]),
    meta: {
      role: row.role || null
    }
  }));
}

async function searchCollections(q, limitPerType) {
  const rows = await Collection.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { key: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ]
    },
    limit: limitPerType,
    order: [['updatedAt', 'DESC']]
  });

  return rows.map(row => ({
    type: 'collection',
    id: row.id,
    name: row.name,
    subtitle: row.key,
    link: '/pages/collections.html',
    score: scoreMany(q, [row.name, row.key, row.description]),
    meta: {
      key: row.key,
      description: clip(row.description)
    }
  }));
}

async function searchRecords(q, limitPerType) {
  const rows = await Record.findAll({
    where: { isDeleted: false },
    include: [
      {
        model: Collection,
        as: 'collection',
        required: false
      }
    ],
    limit: Math.max(limitPerType * 3, 15),
    order: [['updatedAt', 'DESC']]
  });

  const matched = rows
    .filter(row => {
      return (
        includesQuery(row.data, q) ||
        includesQuery(row.meta, q) ||
        includesQuery(row.collection?.name, q) ||
        includesQuery(row.collection?.key, q)
      );
    })
    .slice(0, limitPerType);

  return matched.map(row => ({
    type: 'record',
    id: row.id,
    name: row.collection?.name
      ? `${row.collection.name} record`
      : `Record ${row.id.slice(0, 8)}`,
    subtitle: clip(row.data, 120),
    link: '/pages/records.html',
    score: scoreMany(q, [
      row.collection?.name,
      row.collection?.key,
      row.data,
      row.meta
    ]),
    meta: {
      collectionId: row.collectionId,
      collectionName: row.collection?.name || null,
      preview: clip(row.data, 200)
    }
  }));
}

async function searchFiles(q, limitPerType) {
  const rows = await FileEntry.findAll({
    where: {
      [Op.or]: [
        { originalName: { [Op.like]: `%${q}%` } },
        { storedName: { [Op.like]: `%${q}%` } },
        { mimeType: { [Op.like]: `%${q}%` } },
        { collectionKey: { [Op.like]: `%${q}%` } }
      ]
    },
    limit: limitPerType,
    order: [['updatedAt', 'DESC']]
  });

  return rows.map(row => ({
    type: 'file',
    id: row.id,
    name: row.originalName,
    subtitle: row.mimeType || row.collectionKey || 'file',
    link: '/pages/files.html',
    score: scoreMany(q, [
      row.originalName,
      row.storedName,
      row.mimeType,
      row.collectionKey
    ]),
    meta: {
      mimeType: row.mimeType || null,
      collectionKey: row.collectionKey || null,
      visibility: row.visibility || null
    }
  }));
}

async function searchTenants(q, limitPerType) {
  const rows = await Tenant.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { slug: { [Op.like]: `%${q}%` } },
        { ownerName: { [Op.like]: `%${q}%` } },
        { ownerEmail: { [Op.like]: `%${q}%` } },
        { notes: { [Op.like]: `%${q}%` } }
      ]
    },
    limit: limitPerType,
    order: [['updatedAt', 'DESC']]
  });

  return rows.map(row => ({
    type: 'tenant',
    id: row.id,
    name: row.name,
    subtitle: row.slug,
    link: '/pages/tenants.html',
    score: scoreMany(q, [
      row.name,
      row.slug,
      row.ownerName,
      row.ownerEmail,
      row.notes
    ]),
    meta: {
      slug: row.slug,
      ownerName: row.ownerName || null,
      ownerEmail: row.ownerEmail || null,
      status: row.status || null
    }
  }));
}

exports.globalSearch = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const limitPerType = Math.min(Math.max(Number(req.query.limitPerType || 5), 1), 20);

    if (!q) {
      return res.json({
        success: true,
        query: '',
        count: 0,
        results: []
      });
    }

    const groups = await Promise.all([
      searchUsers(q, limitPerType),
      searchCollections(q, limitPerType),
      searchRecords(q, limitPerType),
      searchFiles(q, limitPerType),
      searchTenants(q, limitPerType)
    ]);

    const results = groups
      .flat()
      .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)))
      .slice(0, limit)
      .map(({ score, ...item }) => item);

    return res.json({
      success: true,
      query: q,
      count: results.length,
      results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
