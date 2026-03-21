const Record = require('../../records/models/record.model');

exports.executeQuery = async ({ collectionKey, query }) => {
  try {
    const where = query.filter || {};
    const rows = await Record.findAll({
      where,
      limit: 50
    }).catch(() => []);

    return {
      success: true,
      resultCount: rows.length,
      rows
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
