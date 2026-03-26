const notificationService = require('./notification.service');

function safeCreate(payload) {
  try {
    if (!notificationService || typeof notificationService.create !== 'function') {
      return null;
    }
    return notificationService.create(payload || {});
  } catch (error) {
    console.error('[notification-trigger] failed:', error.message);
    return null;
  }
}

function queueFailed(job) {
  return safeCreate({
    title: 'Queue Job Failed',
    message: `${job?.type || job?.name || 'Job'} failed${job?.id ? ' (' + job.id + ')' : ''}.`,
    level: 'error',
    source: 'queue-monitor'
  });
}

function queueRecovered(job) {
  return safeCreate({
    title: 'Queue Job Recovered',
    message: `${job?.type || job?.name || 'Job'} completed successfully${job?.id ? ' (' + job.id + ')' : ''}.`,
    level: 'success',
    source: 'queue-monitor'
  });
}

function backupSucceeded(meta = {}) {
  return safeCreate({
    title: 'Backup Completed',
    message: `Backup finished successfully${meta?.name ? ': ' + meta.name : ''}.`,
    level: 'success',
    source: 'backup-monitor'
  });
}

function backupFailed(meta = {}) {
  return safeCreate({
    title: 'Backup Failed',
    message: meta?.message || 'Backup process failed.',
    level: 'error',
    source: 'backup-monitor'
  });
}

module.exports = {
  queueFailed,
  queueRecovered,
  backupSucceeded,
  backupFailed
};
