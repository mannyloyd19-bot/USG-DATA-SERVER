const JobQueue = require('../models/job-queue.model');
const notificationTrigger = require('../../notifications/services/notification-trigger.service');

exports.list = async (req, res) => {
  try {
    const rows = await JobQueue.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ success: true, jobs: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { jobType, payload, runAt } = req.body || {};
    if (!jobType) {
      return res.status(400).json({ success: false, message: 'jobType is required' });
    }

    const row = await JobQueue.create({
      jobType,
      payloadJson: JSON.stringify(payload || {}),
      runAt: runAt || null,
      status: 'pending'
    });

    return res.json({ success: true, job: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};