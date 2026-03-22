const MAX_LOGS = 300;
const logs = [];

function pushLog(level, message, meta = null) {
  logs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level: String(level || 'info'),
    message: String(message || ''),
    meta: meta || null,
    createdAt: new Date().toISOString()
  });

  if (logs.length > MAX_LOGS) logs.pop();
}

function getLogs() {
  return logs;
}

module.exports = {
  pushLog,
  getLogs
};
