const express = require('express');
const router = express.Router();

router.get('/release', async (req, res) => {
  return res.json({
    success: true,
    data: {
      product: 'USG DATA SERVER',
      version: '0.9.0',
      stage: 'final-polish',
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DB_DIALECT || 'sqlite',
      installerEnabled: String(process.env.INSTALLER_ENABLED || 'true') === 'true',
      helmetEnabled: String(process.env.HELMET_ENABLED || 'true') === 'true',
      corsEnabled: String(process.env.CORS_ENABLED || 'true') === 'true',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
