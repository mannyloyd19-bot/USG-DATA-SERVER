const service = require('../services/relational.service');

function handleError(res, error, fallback = 'Request failed') {
  const msg = error.message || fallback;

  if (
    msg.includes('required') ||
    msg.includes('exists') ||
    msg.includes('Invalid') ||
    msg.includes('must be')
  ) {
    return res.status(400).json({ message: msg });
  }

  if (msg === 'Table not found') {
    return res.status(404).json({ message: msg });
  }

  return res.status(500).json({ message: fallback, error: msg });
}

exports.createTable = async (req, res) => {
  try {
    const table = await service.createTable(req.body || {});
    return res.status(201).json(table);
  } catch (error) {
    return handleError(res, error, 'Failed to create table');
  }
};

exports.listTables = async (req, res) => {
  try {
    const tables = await service.listTables();
    return res.json(tables);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch tables');
  }
};

exports.createColumn = async (req, res) => {
  try {
    const column = await service.createColumn({
      tableKey: req.params.tableKey,
      payload: req.body || {}
    });
    return res.status(201).json(column);
  } catch (error) {
    return handleError(res, error, 'Failed to create column');
  }
};

exports.listColumns = async (req, res) => {
  try {
    const columns = await service.listColumns({
      tableKey: req.params.tableKey
    });
    return res.json(columns);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch columns');
  }
};

exports.createRow = async (req, res) => {
  try {
    const row = await service.createRow({
      tableKey: req.params.tableKey,
      inputData: req.body.data || {}
    });
    return res.status(201).json(row);
  } catch (error) {
    return handleError(res, error, 'Failed to create row');
  }
};

exports.listRows = async (req, res) => {
  try {
    const rows = await service.listRows({
      tableKey: req.params.tableKey
    });
    return res.json(rows);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch rows');
  }
};
