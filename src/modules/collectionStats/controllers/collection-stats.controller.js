const fs = require('fs');
const path = require('path');

function safeRequire(p) {
  try {
    return require(p);
  } catch {
    return null;
  }
}

const Collection = safeRequire('../../collections/models/collection.model');
const FileEntry = safeRequire('../../files/models/file.model');

function countJsonSize(value) {
  try {
    return Buffer.byteLength(JSON.stringify(value || {}), 'utf8');
  } catch {
    return 0;
  }
}

exports.summary = async (req, res) => {
  try {
    const rows = [];

    if (Collection && typeof Collection.findAll === 'function') {
      const collections = await Collection.findAll({ order: [['createdAt', 'DESC']] });

      for (const col of collections) {
        const json = col.toJSON ? col.toJSON() : col;
        const collectionKey = json.key || json.collectionKey || json.name || 'unknown';

        let recordCount = 0;
        let approxBytes = 0;

        try {
          const dbPath = process.env.DB_STORAGE || './database.sqlite';
          if (fs.existsSync(path.resolve(dbPath))) {
            const sqlite3 = require('sqlite3').verbose();
            const db = new sqlite3.Database(dbPath);

            const tableName = json.tableName || json.key || null;

            if (tableName) {
              recordCount = await new Promise((resolve) => {
                db.get(`SELECT COUNT(*) as count FROM "${tableName}"`, (err, row) => {
                  if (err) return resolve(0);
                  resolve((row && row.count) || 0);
                });
              });

              approxBytes = await new Promise((resolve) => {
                db.all(`SELECT * FROM "${tableName}" LIMIT 200`, (err, rows) => {
                  if (err) return resolve(0);
                  const size = (rows || []).reduce((sum, item) => sum + countJsonSize(item), 0);
                  resolve(size);
                });
              });
            }

            db.close();
          }
        } catch {}

        rows.push({
          id: json.id || null,
          collectionKey,
          name: json.name || collectionKey,
          tableName: json.tableName || json.key || null,
          recordCount,
          approxBytes
        });
      }
    }

    let filesCount = 0;
    let filesBytes = 0;

    if (FileEntry && typeof FileEntry.findAll === 'function') {
      const files = await FileEntry.findAll();
      filesCount = files.length;
      filesBytes = files.reduce((sum, f) => sum + Number((f.toJSON ? f.toJSON() : f).size || 0), 0);
    }

    return res.json({
      success: true,
      collections: rows,
      files: {
        count: filesCount,
        bytes: filesBytes
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load collection stats',
      error: error.message
    });
  }
};
