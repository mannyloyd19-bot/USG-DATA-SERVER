const UsageEvent = require('../../usageTracking/models/usage-event.model');
const JobQueue = require('../../jobQueue/models/job-queue.model');

exports.overview = async (req, res) => {
  try {
    const usageCount = await UsageEvent.count().catch(() => 0);
    const pendingJobs = await JobQueue.count({ where: { status: 'pending' } }).catch(() => 0);
    const failedJobs = await JobQueue.count({ where: { status: 'failed' } }).catch(() => 0);
    const completedJobs = await JobQueue.count({ where: { status: 'completed' } }).catch(() => 0);

    return res.json({
      success: true,
      overview: {
        usageCount,
        pendingJobs,
        failedJobs,
        completedJobs,
        rateLimiting: true,
        tenantIsolation: true,
        jobQueue: true
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
