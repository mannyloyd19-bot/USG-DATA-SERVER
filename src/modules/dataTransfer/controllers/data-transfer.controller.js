const sequelize = require('../../../core/database');
const Collection = require('../../collections/models/collection.model');
const Record = require('../../records/models/record.model');

let Field = null;
try {
  Field = require('../../fields/models/field.model');
} catch (_) {
  Field = null;
}

function normalizeCollectionKey(value) {
  return String(value || '').trim();
}

function asPlain(row) {
  return row && typeof row.toJSON === 'function' ? row.toJSON() : row;
}

async function findCollectionByKey(collectionKey) {
  return Collection.findOne({
    where: { key: collectionKey }
  });
}

exports.exportCollections = async (req, res) => {
  try {
    const rows = await Collection.findAll({
      order: [['name', 'ASC']]
    });

    return res.json({
      success: true,
      count: rows.length,
      collections: rows.map(asPlain)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to export collections list',
      error: error.message
    });
  }
};

exports.exportCollectionBundle = async (req, res) => {
  try {
    const collectionKey = normalizeCollectionKey(req.params.collectionKey);
    if (!collectionKey) {
      return res.status(400).json({
        success: false,
        message: 'Collection key is required'
      });
    }

    const collection = await findCollectionByKey(collectionKey);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    let fields = [];
    if (Field) {
      try {
        fields = await Field.findAll({
          where: { collectionId: collection.id },
          order: [['createdAt', 'ASC']]
        });
      } catch (_) {
        fields = [];
      }
    }

    const records = await Record.findAll({
      where: {
        collectionId: collection.id,
        isDeleted: false
      },
      order: [['createdAt', 'ASC']]
    });

    return res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      bundle: {
        version: 1,
        type: 'usg_collection_bundle',
        collection: asPlain(collection),
        fields: fields.map(asPlain),
        records: records.map(asPlain)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to export collection bundle',
      error: error.message
    });
  }
};

exports.importCollectionRecords = async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const collectionKey = normalizeCollectionKey(req.params.collectionKey);
    const mode = String(req.body?.mode || 'insert').trim().toLowerCase();
    const matchKey = String(req.body?.matchKey || '').trim();
    const payloadRecords = Array.isArray(req.body?.records) ? req.body.records : null;

    if (!collectionKey) {
      await tx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Collection key is required'
      });
    }

    if (!payloadRecords) {
      await tx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Body must include records: []'
      });
    }

    if (!['insert', 'upsert'].includes(mode)) {
      await tx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Mode must be insert or upsert'
      });
    }

    if (mode === 'upsert' && !matchKey) {
      await tx.rollback();
      return res.status(400).json({
        success: false,
        message: 'matchKey is required for upsert mode'
      });
    }

    const collection = await findCollectionByKey(collectionKey);
    if (!collection) {
      await tx.rollback();
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < payloadRecords.length; i += 1) {
      const item = payloadRecords[i] || {};
      const data = item.data && typeof item.data === 'object' ? item.data : item;
      const meta = item.meta && typeof item.meta === 'object' ? item.meta : {};

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        errors.push({ index: i, message: 'Record data must be an object' });
        skipped += 1;
        continue;
      }

      if (mode === 'insert') {
        await Record.create({
          collectionId: collection.id,
          data,
          meta,
          isDeleted: false
        }, { transaction: tx });
        inserted += 1;
        continue;
      }

      const matchValue = data[matchKey];
      if (matchValue === undefined || matchValue === null || matchValue === '') {
        errors.push({ index: i, message: `Missing matchKey value: ${matchKey}` });
        skipped += 1;
        continue;
      }

      const candidates = await Record.findAll({
        where: {
          collectionId: collection.id,
          isDeleted: false
        },
        transaction: tx
      });

      const existing = candidates.find(row => {
        const rowData = row.data || {};
        return String(rowData[matchKey]) === String(matchValue);
      });

      if (existing) {
        existing.data = data;
        existing.meta = {
          ...(existing.meta || {}),
          ...(meta || {}),
          importedAt: new Date().toISOString()
        };
        await existing.save({ transaction: tx });
        updated += 1;
      } else {
        await Record.create({
          collectionId: collection.id,
          data,
          meta,
          isDeleted: false
        }, { transaction: tx });
        inserted += 1;
      }
    }

    await tx.commit();

    return res.json({
      success: true,
      message: 'Import completed',
      summary: {
        collectionKey,
        mode,
        matchKey: matchKey || null,
        total: payloadRecords.length,
        inserted,
        updated,
        skipped,
        errors
      }
    });
  } catch (error) {
    await tx.rollback();
    return res.status(500).json({
      success: false,
      message: 'Failed to import records',
      error: error.message
    });
  }
};
