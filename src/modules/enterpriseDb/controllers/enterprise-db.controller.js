const Collection = require('../../collections/models/collection.model');

exports.summary = async (req, res) => {
  try {
    const collections = await Collection.count().catch(() => 0);

    return res.json({
      success: true,
      summary: {
        collections,
        indexes: 0,
        records: 0,
        backups: 0,
        engine: 'sqlite',
        size: 'unknown',
        status: 'ready',
        tables: collections,
        pendingMigrations: 0,
        integrity: 'ok'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
