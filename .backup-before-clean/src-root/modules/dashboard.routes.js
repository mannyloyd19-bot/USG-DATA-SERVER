const express = require('express');
const User = require('./users/models/user.model');
const Collection = require('./collections/models/collection.model');
const Record = require('./records/models/record.model');
const FileEntry = require('./files/models/file.model');
const RelTable = require('./relational/models/table.model');
const Relationship = require('./relationships/models/relationship.model');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const [users, collections, records, files, tables, relationships] = await Promise.all([
      User.count(),
      Collection.count(),
      Record.count({ where: { isDeleted: false } }),
      FileEntry.count(),
      RelTable.count(),
      Relationship.count()
    ]);

    return res.json({
      success: true,
      data: {
        users,
        collections,
        records,
        files,
        tables,
        relationships,
        mode: process.env.DB_DIALECT || 'sqlite'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats',
      error: error.message
    });
  }
});

module.exports = router;
