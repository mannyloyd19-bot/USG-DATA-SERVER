const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);

function isTrue(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

router.get('/release', async (req, res) => {
  return res.json({
    success: true,
    data: {
      product: 'NexaCore',
      version: '1.0.0',
      stage: 'release-lockdown',
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DB_DIALECT || 'sqlite',
      installerEnabled: isTrue(process.env.ALLOW_INSTALLER, true) && !isTrue(process.env.RELEASE_LOCKDOWN, false),
      bootstrapEnabled: isTrue(process.env.ALLOW_BOOTSTRAP, true) && !isTrue(process.env.RELEASE_LOCKDOWN, false),
      releaseLockdown: isTrue(process.env.RELEASE_LOCKDOWN, false),
      helmetEnabled: isTrue(process.env.HELMET_ENABLED, true),
      corsEnabled: isTrue(process.env.CORS_ENABLED, true),
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
