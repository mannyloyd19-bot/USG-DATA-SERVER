const JobQueue = require('../models/job-queue.model');

function parsePayload(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

async function handleJob(job) {
  const payload = parsePayload(job.payloadJson);

  switch (job.jobType) {
    case 'backup':
      return { ok: true, message: `Backup job simulated for ${payload.target || 'system'}` };
    case 'sync-domain':
      return { ok: true, message: `Domain sync simulated for ${payload.domain || 'unknown'}` };
    case 'cleanup-logs':
      return { ok: true, message: 'Log cleanup simulated' };
    default:
      return { ok: true, message: `No-op handler for ${job.jobType}` };
  }
}

async function runPendingJobs() {
  const jobs = await JobQueue.findAll({
    where: { status: 'pending' },
    order: [['createdAt', 'ASC']],
    limit: 10
  });

  for (const job of jobs) {
    try {
      job.status = 'running';
      await job.save();

      await handleJob(job);

      job.status = 'completed';
      job.lastError = null;
      await job.save();
    } catch (error) {
      job.status = 'failed';
      job.lastError = error.message;
      await job.save();
    }
  }
}

module.exports = {
  runPendingJobs
};
