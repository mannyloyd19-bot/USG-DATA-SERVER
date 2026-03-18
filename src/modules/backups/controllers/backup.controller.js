const fs = require('fs');
const path = require('path');
const sequelize = require('../../../core/database');
const backupService = require('../services/backup.service');

exports.create = async (req, res) => {
  try {
    const item = await backupService.createBackup();
    return res.status(201).json({
      message: 'Backup created successfully',
      backup: item
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create backup',
      error: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const items = await backupService.listBackups();
    return res.json(items);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch backups',
      error: error.message
    });
  }
};

exports.restore = async (req, res) => {
  try {
    const filename = req.params.filename;
    const backupsDir = path.join(process.cwd(), 'backups');
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    const source = path.join(backupsDir, filename);

    if (!fs.existsSync(source)) {
      return res.status(404).json({ message: 'Backup file not found' });
    }

    const restoreMarker = path.join(process.cwd(), 'database.sqlite.restore_pending');

    fs.copyFileSync(source, restoreMarker);

    return res.json({
      success: true,
      message: 'Restore prepared successfully. Restart the server to apply the restored database.',
      restoreFile: restoreMarker,
      sourceBackup: filename,
      databasePath: dbPath
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to prepare restore',
      error: error.message
    });
  }
};
