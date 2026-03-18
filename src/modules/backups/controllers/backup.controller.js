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
