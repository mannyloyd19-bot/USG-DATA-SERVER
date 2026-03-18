require('dotenv').config();
const backupService = require('../src/modules/backups/services/backup.service');

(async () => {
  try {
    const result = await backupService.createBackup();
    console.log('Manual backup created:', result.filename);
    process.exit(0);
  } catch (error) {
    console.error('Manual backup failed:', error.message);
    process.exit(1);
  }
})();
