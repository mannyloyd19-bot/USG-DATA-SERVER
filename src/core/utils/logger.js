const fs = require('fs');
const path = require('path');

const logFile = path.join(process.cwd(), 'logs', 'errors.log');

exports.logError = (err) => {
  const line = `[${new Date().toISOString()}] ${err.stack || err.message}\n`;
  fs.appendFileSync(logFile, line);
};
