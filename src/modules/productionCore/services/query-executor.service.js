const Collection = require('../../collections/models/collection.model');
const Record = require('../../records/models/record.model');

function getValueByPath(obj, path) {
  if (!path) return undefined;
  return String(path)
    .split('.')
    .reduce((acc, key) => (acc !== undefined && acc !== null ? acc[key] : undefined), obj);
}

function flattenValues(obj) {
  const out = [];
  function walk(value) {
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (value && typeof value === 'object') {
      for (const item of Object.values(value)) walk(item);
      return;
    }
    out.push(value);
  }
  walk(obj);
  return out;
}

function applyFilters(records, filters) {
  if (!filters || typeof filters !== 'object') return records;

  return records.filter((record) => {
    const data = record.data || {};

    return Object.entries(filters).every(([field, condition]) => {
      const value = getValueByPath(data, field);

      if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
        if (Object.prototype.hasOwnProperty.call(condition, 'eq') && value !== condition.eq) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'ne') && value === condition.ne) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'gt') && !(value > condition.gt)) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'gte') && !(value >= condition.gte)) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'lt') && !(value < condition.lt)) return false;
        if (Object.prototype.hasOwnProperty.call(condition, 'lte') && !(value <= condition.lte)) return false;

        if (Object.prototype.hasOwnProperty.call(condition, 'between')) {
          const range = condition.between;
          if (!Array.isArray(range) || range.length !== 2) return false;
          if (!(value >= range[0] && value <= range[1])) return false;
        }

        if (Object.prototype.hasOwnProperty.call(condition, 'contains')) {
          const target = String(condition.contains).toLowerCase();
          if (!String(value || '').toLowerCase().includes(target)) return false;
        }

        if (Object.prototype.hasOwnProperty.call(condition, 'startsWith')) {
          const target = String(condition.startsWith).toLowerCase();
          if (!String(value || '').toLowerCase().startsWith(target)) return false;
        }

        if (Object.prototype.hasOwnProperty.call(condition, 'endsWith')) {
          const target = String(condition.endsWith).toLowerCase();
          if (!String(value || '').toLowerCase().endsWith(target)) return false;
        }

        if (Object.prototype.hasOwnProperty.call(condition, 'in')) {
          if (!Array.isArray(condition.in) || !condition.in.includes(value)) return false;
        }

        if (Object.prototype.hasOwnProperty.call(condition, 'exists')) {
          const shouldExist = Boolean(condition.exists);
          const exists = value !== undefined;
          if (shouldExist !== exists) return false;
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
    return flattenValues(data).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(needle);
    });
  });
}

function applySort(records, sortBy, sortOrder = 'asc') {
  if (!sortBy) return records;

  const direction = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;

  return [...records].sort((a, b) => {
    const av = getValueByPath(a.data || {}, sortBy);
    const bv = getValueByPath(b.data || {}, sortBy);

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
      picked[key] = getValueByPath(record.data || {}, key);
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

exports.executeQuery = async ({ collectionKey, query = {} }) => {
  try {
    if (!collectionKey) {
      return { success: false, message: 'collectionKey is required' };
    }

    const collection = await Collection.findOne({ where: { key: collectionKey } });
    if (!collection) {
      return { success: false, message: 'Collection not found' };
    }

    const page = Math.max(parseInt(query.page || '1', 10), 1);
    const limit = Math.max(parseInt(query.limit || '20', 10), 1);
    const offset = (page - 1) * limit;
    const includeDeleted = Boolean(query.includeDeleted);

    let records = await Record.findAll({
      where: {
        collectionId: collection.id,
        ...(includeDeleted ? {} : { isDeleted: false })
      },
      order: [['createdAt', 'DESC']]
    });

    const filters = query.filter || {};
    const select = Array.isArray(query.select) ? query.select : [];

    records = applyFilters(records, filters);
    records = applySearch(records, query.search);
    records = applySort(records, query.sort?.field, query.sort?.order);

    const total = records.length;
    const paged = records.slice(offset, offset + limit);
    const selected = applySelect(paged, select);

    return {
      success: true,
      resultCount: selected.length,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      rows: selected
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
