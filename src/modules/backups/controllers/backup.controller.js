const fs = require('fs');
const path = require('path');
const backupService = require('../services/backup.service');
const { DB_STORAGE, BACKUP_DIR } = require('../../../core/utils/paths');

exports.create = async (req, res) => {
  try {
    const backup = await backupService.createBackup();
    return res.status(201).json({ success: true, backup });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    return res.json({ success: true, backups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch backups', error: error.message });
  }
};

exports.restore = async (req, res) => {
  try {
    const { filename } = req.params;
    const source = path.join(BACKUP_DIR, filename);
    const restoreMarker = `${DB_STORAGE}.restore_pending`;

    if (!fs.existsSync(source)) {
      return res.status(404).json({ success: false, message: 'Backup file not found' });
    }

    fs.copyFileSync(source, restoreMarker);

    return res.json({
      success: true,
      message: 'Restore scheduled. Restart the server to apply the selected backup.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
