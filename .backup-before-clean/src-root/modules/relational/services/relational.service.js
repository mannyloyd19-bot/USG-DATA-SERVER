const RelTable = require('../models/table.model');
const RelColumn = require('../models/column.model');
const RelRow = require('../models/row.model');

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeValueByType(type, value, column) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  switch (String(type || 'TEXT').toUpperCase()) {
    case 'TEXT':
      return String(value);
    case 'NUMBER': {
      const num = Number(value);
      if (Number.isNaN(num)) throw new Error(`Column "${column.key}" must be a valid number`);
      return num;
    }
    case 'BOOLEAN':
      if (typeof value === 'boolean') return value;
      if (value === 'true' || value === '1' || value === 1) return true;
      if (value === 'false' || value === '0' || value === 0) return false;
      throw new Error(`Column "${column.key}" must be a valid boolean`);
    case 'DATE': {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) throw new Error(`Column "${column.key}" must be a valid date`);
      return d.toISOString();
    }
    default:
      return value;
  }
}

async function getTableByKey(tableKey) {
  const table = await RelTable.findOne({ where: { key: tableKey } });
  if (!table) throw new Error('Table not found');
  return table;
}

async function getColumnsByTableId(tableId) {
  return RelColumn.findAll({
    where: { tableId, isActive: true },
    order: [['createdAt', 'ASC']]
  });
}

async function validateUniqueColumns(tableId, columns, payload, excludeRowId = null) {
  for (const column of columns) {
    if (!column.uniqueValue) continue;
    const value = payload[column.key];
    if (value === undefined || value === null || value === '') continue;

    const rows = await RelRow.findAll({
      where: { tableId, isDeleted: false }
    });

    const conflict = rows.find((r) => {
      if (excludeRowId && r.id === excludeRowId) return false;
      return r.data && r.data[column.key] === value;
    });

    if (conflict) {
      throw new Error(`Column "${column.key}" must be unique`);
    }
  }
}

function buildPayload(columns, inputData, existingData = {}) {
  const result = { ...existingData };

  for (const column of columns) {
    const incoming = inputData[column.key];
    const hasIncoming = Object.prototype.hasOwnProperty.call(inputData, column.key);

    if (hasIncoming) {
      result[column.key] = normalizeValueByType(column.type, incoming, column);
    } else if (result[column.key] === undefined && column.defaultValue != null) {
      result[column.key] = column.defaultValue;
    }

    if (column.required) {
      const value = result[column.key];
      if (value === undefined || value === null || value === '') {
        throw new Error(`Column "${column.key}" is required`);
      }
    }
  }

  return result;
}

exports.normalizeKey = normalizeKey;

exports.createTable = async ({ name, key, description }) => {
  if (!name) throw new Error('Table name is required');
  const finalKey = normalizeKey(key || name);
  if (!finalKey) throw new Error('Invalid table key');

  const existing = await RelTable.findOne({ where: { key: finalKey } });
  if (existing) throw new Error('Table key already exists');

  return RelTable.create({
    name,
    key: finalKey,
    description: description || null
  });
};

exports.listTables = async () => {
  return RelTable.findAll({ order: [['createdAt', 'DESC']] });
};

exports.createColumn = async ({ tableKey, payload }) => {
  const table = await getTableByKey(tableKey);
  if (!payload.name) throw new Error('Column name is required');

  const finalKey = normalizeKey(payload.key || payload.name);
  const exists = await RelColumn.findOne({
    where: { tableId: table.id, key: finalKey }
  });
  if (exists) throw new Error('Column key already exists');

  return RelColumn.create({
    tableId: table.id,
    name: payload.name,
    key: finalKey,
    type: String(payload.type || 'TEXT').toUpperCase(),
    required: Boolean(payload.required),
    uniqueValue: Boolean(payload.uniqueValue),
    defaultValue: payload.defaultValue ?? null
  });
};

exports.listColumns = async ({ tableKey }) => {
  const table = await getTableByKey(tableKey);
  return RelColumn.findAll({
    where: { tableId: table.id },
    order: [['createdAt', 'ASC']]
  });
};

exports.createRow = async ({ tableKey, inputData }) => {
  const table = await getTableByKey(tableKey);
  const columns = await getColumnsByTableId(table.id);
  const payload = buildPayload(columns, inputData || {}, {});
  await validateUniqueColumns(table.id, columns, payload);

  return RelRow.create({
    tableId: table.id,
    data: payload
  });
};

exports.listRows = async ({ tableKey }) => {
  const table = await getTableByKey(tableKey);
  return RelRow.findAll({
    where: { tableId: table.id, isDeleted: false },
    order: [['createdAt', 'DESC']]
  });
};
