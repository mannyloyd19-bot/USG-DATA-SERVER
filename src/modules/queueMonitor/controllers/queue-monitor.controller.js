const JobQueue = require('../../jobQueue/models/job-queue.model');

async function safeCount(where = {}) {
  try {
    return await JobQueue.count({ where });
  } catch {
    return 0;
  }
}

exports.summary = async (req, res) => {
  try {
    const [total, pending, running, completed, failed] = await Promise.all([
      safeCount(),
      safeCount({ status: 'pending' }),
      safeCount({ status: 'running' }),
      safeCount({ status: 'completed' }),
      safeCount({ status: 'failed' })
    ]);

    return res.json({
      success: true,
      summary: { total, pending, running, completed, failed }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const rows = await JobQueue.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    return res.json({ success: true, jobs: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.retry = async (req, res) => {
  try {
    const item = await JobQueue.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    item.status = 'pending';
    item.error = null;
    await item.save();

    return res.json({ success: true, job: item, message: 'Job re-queued' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const item = await JobQueue.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    item.status = 'cancelled';
    await item.save();

    return res.json({ success: true, job: item, message: 'Job cancelled' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
