const recordService = require('../services/record.service');

function handleError(res, error, fallbackMessage) {
  const msg = error.message || fallbackMessage;

  if (msg === 'Collection not found') {
    return res.status(404).json({ message: msg });
  }

  if (msg === 'Record not found') {
    return res.status(404).json({ message: msg });
  }

  if (msg.includes('required') || msg.includes('must be') || msg.includes('unique')) {
    return res.status(400).json({ message: msg });
  }

  return res.status(500).json({ message: fallbackMessage, error: msg });
}

exports.create = async (req, res) => {
  try {
    const record = await recordService.createRecord({
      collectionKey: req.params.collectionKey,
      inputData: req.body.data || {},
      user: req.user
    });

    return res.status(201).json(record);
  } catch (error) {
    return handleError(res, error, 'Failed to create record');
  }
};

exports.findAll = async (req, res) => {
  try {
    const result = await recordService.listRecords({
      collectionKey: req.params.collectionKey,
      query: req.query
    });

    return res.json(result);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch records');
  }
};

exports.findOne = async (req, res) => {
  try {
    const record = await recordService.getRecord({
      collectionKey: req.params.collectionKey,
      recordId: req.params.recordId,
      includeDeleted: String(req.query.includeDeleted || 'false') === 'true'
    });

    return res.json(record);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch record');
  }
};

exports.update = async (req, res) => {
  try {
    const record = await recordService.updateRecord({
      collectionKey: req.params.collectionKey,
      recordId: req.params.recordId,
      inputData: req.body.data || {},
      user: req.user
    });

    return res.json(record);
  } catch (error) {
    return handleError(res, error, 'Failed to update record');
  }
};

exports.remove = async (req, res) => {
  try {
    const record = await recordService.deleteRecord({
      collectionKey: req.params.collectionKey,
      recordId: req.params.recordId,
      user: req.user
    });

    return res.json({
      message: 'Record soft deleted successfully',
      record
    });
  } catch (error) {
    return handleError(res, error, 'Failed to delete record');
  }
};

exports.restore = async (req, res) => {
  try {
    const record = await recordService.restoreRecord({
      collectionKey: req.params.collectionKey,
      recordId: req.params.recordId,
      user: req.user
    });

    return res.json({
      message: 'Record restored successfully',
      record
    });
  } catch (error) {
    return handleError(res, error, 'Failed to restore record');
  }
};

exports.hardDelete = async (req, res) => {
  try {
    await recordService.hardDeleteRecord({
      collectionKey: req.params.collectionKey,
      recordId: req.params.recordId
    });

    return res.json({ message: 'Record permanently deleted' });
  } catch (error) {
    return handleError(res, error, 'Failed to permanently delete record');
  }
};
