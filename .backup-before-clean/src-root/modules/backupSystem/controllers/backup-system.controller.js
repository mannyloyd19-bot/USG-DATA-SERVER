const fs = require('fs');
const path = require('path');
const BackupJob = require('../models/backup-job.model');
const BackupConfig = require('../models/backup-config.model');
const backupService = require('../services/backup.service');

exports.status = async (req, res) => {
  try {
    const cfg = await backupService.getConfig();
    const jobs = await BackupJob.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const mapped = jobs.map(item => {
      const json = item.toJSON();
      return {
        ...json,
        fileExists: fs.existsSync(path.resolve(json.filePath))
      };
    });

    return res.json({
      success: true,
      autoRunning: backupService.isAutoRunning(),
      config: cfg,
      jobs: mapped
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load backup status',
      error: error.message
    });
  }
};

exports.runNow = async (req, res) => {
  try {
    const job = await backupService.runBackup('manual', 'Manual backup run');
    return res.json({
      success: true,
      message: 'Backup completed',
      job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Backup failed',
      error: error.message
    });
  }
};

exports.saveConfig = async (req, res) => {
  try {
    const cfg = await backupService.getConfig();
    const payload = req.body || {};

    if (payload.backupDir !== undefined) cfg.backupDir = payload.backupDir;
    if (payload.sourceDbPath !== undefined) cfg.sourceDbPath = payload.sourceDbPath;
    if (payload.intervalMinutes !== undefined) cfg.intervalMinutes = Number(payload.intervalMinutes || 60);
    if (payload.retentionCount !== undefined) cfg.retentionCount = Number(payload.retentionCount || 10);

    await cfg.save();

    return res.json({
      success: true,
      message: 'Backup config saved',
      config: cfg
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save backup config',
      error: error.message
    });
  }
};

exports.enableAuto = async (req, res) => {
  try {
    const minutes = Number(req.body?.intervalMinutes || 60);
    const cfg = await backupService.enableAuto(minutes);

    return res.json({
      success: true,
      message: 'Auto backup enabled',
      config: cfg
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to enable auto backup',
      error: error.message
    });
  }
};

exports.disableAuto = async (req, res) => {
  try {
    const cfg = await backupService.disableAuto();

    return res.json({
      success: true,
      message: 'Auto backup disabled',
      config: cfg
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to disable auto backup',
      error: error.message
    });
  }
};
