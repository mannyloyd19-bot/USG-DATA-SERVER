const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const path = require('path');

const router = express.Router();
router.use(authMiddleware);

router.get('/usg-sdk.js', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'sdk', 'usg-sdk.js'));
});

router.get('/info', (req, res) => {
  res.json({
    success: true,
    name: 'USG SDK',
    version: '1.0.0',
    files: [
      '/sdk/usg-sdk.js'
    ]
  });
});

module.exports = router;
