const Collection = require('../../collections/models/collection.model');
const Field = require('../../fields/models/field.model');
const Record = require('../models/record.model');

function toNumber(value) {
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function normalizeDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeValueByType(type, value, field) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  switch (String(type || 'TEXT').toUpperCase()) {
    case 'TEXT':
    case 'LONGTEXT':
    case 'EMAIL':
    case 'URL':
    case 'PHONE':
      return String(value);

    case 'NUMBER':
    case 'DECIMAL':
    case 'CURRENCY': {
      const num = toNumber(value);
      if (num === null) throw new Error(`Field "${field.key}" must be a valid number`);
      return num;
    }

    case 'BOOLEAN':
      if (typeof value === 'boolean') return value;
      if (value === 'true' || value === '1' || value === 1) return true;
      if (value === 'false' || value === '0' || value === 0) return false;
      throw new Error(`Field "${field.key}" must be a valid boolean`);

    case 'DATE':
    case 'DATETIME': {
      const iso = normalizeDate(value);
      if (!iso) throw new Error(`Field "${field.key}" must be a valid date`);
      return iso;
    }

    case 'JSON':
    case 'OBJECT':
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Field "${field.key}" must be an object`);
      }
      return value;

    case 'ARRAY':
      if (!Array.isArray(value)) {
        throw new Error(`Field "${field.key}" must be an array`);
      }
      return value;

    case 'ENUM':
      if (field.options && Array.isArray(field.options.values)) {
        if (!field.options.values.includes(value)) {
          throw new Error(`Field "${field.key}" must be one of: ${field.options.values.join(', ')}`);
        }
      }
      return value;

    default:
      return value;
  }
}

async function getCollectionByKey(collectionKey) {
  const collection = await Collection.findOne({ where: { key: collectionKey } });
  if (!collection) throw new Error('Collection not found');
  return collection;
}

async function getFieldsByCollectionId(collectionId) {
  return Field.findAll({
    where: { collectionId, isActive: true },
    order: [['createdAt', 'ASC']]
  });
}

async function validateUniqueFields(collectionId, fields, payload, excludeRecordId = null) {
  for (const field of fields) {
    if (!field.uniqueValue) continue;
    const value = payload[field.key];
    if (value === undefined || value === null || value === '') continue;

    const records = await Record.findAll({
      where: { collectionId, isDeleted: false }
    });

    const conflict = records.find((r) => {
      if (excludeRecordId && r.id === excludeRecordId) return false;
      return r.data && r.data[field.key] === value;
    });

    if (conflict) {
      throw new Error(`Field "${field.key}" must be unique`);
    }
  }
}

function buildValidatedPayload(fields, inputData, existingData = {}) {
  const result = { ...existingData };

  for (const field of fields) {
    const incoming = inputData[field.key];
    const hasIncoming = Object.prototype.hasOwnProperty.call(inputData, field.key);

    if (hasIncoming) {
      result[field.key] = normalizeValueByType(field.type, incoming, field);
    } else if (
      result[field.key] === undefined &&
      field.defaultValue !== null &&
      field.defaultValue !== undefined
    ) {
      result[field.key] = field.defaultValue;
    }

    if (field.required) {
      const value = result[field.key];
      const emptyString = typeof value === 'string' && value.trim() === '';
      const emptyArray = Array.isArray(value) && value.length === 0;
      if (value === undefined || value === null || emptyString || emptyArray) {
        throw new Error(`Field "${field.key}" is required`);
      }
    }
  }

  return result;
}

function parseJsonParam(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function applyFilters(records, filters) {
  if (!filters || typeof filters !== 'object') return records;

  return records.filter((record) => {
    const data = record.data || {};

    return Object.entries(filters).every(([field, condition]) => {
      const value = data[field];

      if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
        if (Object.prototype.hasOwnProperty.call(condition, 'eq') && value !== condition.eq) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'ne') && value === condition.ne) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'gt') && !(value > condition.gt)) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'gte') && !(value >= condition.gte)) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'lt') && !(value < condition.lt)) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'lte') && !(value <= condition.lte)) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'contains')) {
          const target = String(condition.contains).toLowerCase();
          if (!String(value || '').toLowerCase().includes(target)) return false;
        }
        if (Object.prototype.hasOwnProperty.call(condition, 'in')) {
          if (!Array.isArray(condition.in) || !condition.in.includes(value)) return false;
        }
        return true;
      }

      return value === condition;
    });
  });
}

function applySearch(records, search) {
  if (!search) return records;
  const needle = String(search).toLowerCase();

  return records.filter((record) => {
    const data = record.data || {};
    return Object.values(data).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(needle);
    });
  });
}

function applySort(records, sortBy, sortOrder = 'asc') {
  if (!sortBy) return records;

  const direction = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;

  return [...records].sort((a, b) => {
    const av = a.data ? a.data[sortBy] : undefined;
    const bv = b.data ? b.data[sortBy] : undefined;

    if (av === bv) return 0;
    if (av === undefined || av === null) return 1;
    if (bv === undefined || bv === null) return -1;
    if (av > bv) return 1 * direction;
    if (av < bv) return -1 * direction;
    return 0;
  });
}

function applySelect(records, select) {
  if (!select || !Array.isArray(select) || select.length === 0) return records;

  return records.map((record) => {
    const picked = {};
    for (const key of select) {
      if (record.data && Object.prototype.hasOwnProperty.call(record.data, key)) {
        picked[key] = record.data[key];
      }
    }

    return {
      id: record.id,
      collectionId: record.collectionId,
      data: picked,
      meta: record.meta,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  });
}

exports.createRecord = async ({ collectionKey, inputData, user }) => {
  const collection = await getCollectionByKey(collectionKey);
  const fields = await getFieldsByCollectionId(collection.id);
  const payload = buildValidatedPayload(fields, inputData || {}, {});
  await validateUniqueFields(collection.id, fields, payload);

  const record = await Record.create({
    collectionId: collection.id,
    data: payload,
    meta: {
      createdBy: user ? user.id : null,
      updatedBy: user ? user.id : null
    }
  });

  return record;
};

exports.listRecords = async ({ collectionKey, query }) => {
  const collection = await getCollectionByKey(collectionKey);
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.max(parseInt(query.limit || '10', 10), 1);
  const offset = (page - 1) * limit;
  const includeDeleted = String(query.includeDeleted || 'false') === 'true';

  let records = await Record.findAll({
    where: {
      collectionId: collection.id,
      ...(includeDeleted ? {} : { isDeleted: false })
    },
    order: [['createdAt', 'DESC']]
  });

  const filters = parseJsonParam(query.filters, {});
  const select = String(query.select || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  records = applyFilters(records, filters);
  records = applySearch(records, query.search);
  records = applySort(records, query.sortBy, query.sortOrder);
  const total = records.length;
  const paged = records.slice(offset, offset + limit);
  const selected = applySelect(paged, select);

  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    items: selected
  };
};

exports.getRecord = async ({ collectionKey, recordId, includeDeleted = false }) => {
  const collection = await getCollectionByKey(collectionKey);

  const record = await Record.findOne({
    where: {
      id: recordId,
      collectionId: collection.id,
      ...(includeDeleted ? {} : { isDeleted: false })
    }
  });

  if (!record) throw new Error('Record not found');
  return record;
};

exports.updateRecord = async ({ collectionKey, recordId, inputData, user }) => {
  const collection = await getCollectionByKey(collectionKey);
  const record = await Record.findOne({
    where: {
      id: recordId,
      collectionId: collection.id,
      isDeleted: false
    }
  });

  if (!record) throw new Error('Record not found');

  const fields = await getFieldsByCollectionId(collection.id);
  const payload = buildValidatedPayload(fields, inputData || {}, record.data || {});
  await validateUniqueFields(collection.id, fields, payload, record.id);

  record.data = payload;
  record.meta = {
    ...(record.meta || {}),
    updatedBy: user ? user.id : null
  };

  await record.save();
  return record;
};

exports.deleteRecord = async ({ collectionKey, recordId, user }) => {
  const record = await exports.getRecord({ collectionKey, recordId, includeDeleted: false });

  record.isDeleted = true;
  record.deletedAt = new Date();
  record.meta = {
    ...(record.meta || {}),
    deletedBy: user ? user.id : null
  };

  await record.save();
  return record;
};

exports.restoreRecord = async ({ collectionKey, recordId, user }) => {
  const record = await exports.getRecord({ collectionKey, recordId, includeDeleted: true });

  if (!record.isDeleted) return record;

  record.isDeleted = false;
  record.deletedAt = null;
  record.meta = {
    ...(record.meta || {}),
    restoredBy: user ? user.id : null,
    updatedBy: user ? user.id : null
  };

  await record.save();
  return record;
};

exports.hardDeleteRecord = async ({ collectionKey, recordId }) => {
  const record = await exports.getRecord({ collectionKey, recordId, includeDeleted: true });
  await record.destroy();
  return true;
};
