const MAX_APP_LOGS = 400;
const appLogs = [];

function pushAppLog(level, message, meta = null) {
  appLogs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level: String(level || 'info'),
    message: String(message || ''),
    meta: meta || null,
    createdAt: new Date().toISOString()
  });

  if (appLogs.length > MAX_APP_LOGS) {
    appLogs.pop();
  }
}

function getAppLogs() {
  return appLogs;
}

module.exports = {
  pushAppLog,
  getAppLogs
};
