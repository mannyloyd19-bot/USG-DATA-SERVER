const { runPendingJobs } = require('./job-runner.service');

function startJobRunner() {
  setInterval(async () => {
    try {
      await runPendingJobs();
    } catch (error) {
      console.error('[jobRunner] error:', error.message);
    }
  }, 15000);
}

module.exports = { startJobRunner };
