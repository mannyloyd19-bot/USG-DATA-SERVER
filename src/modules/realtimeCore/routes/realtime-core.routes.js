const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const router = express.Router();
router.use(authMiddleware);

router.get('/status', (req, res) => {
  return res.json({
    success: true,
    realtime: 'active'
  });
});

module.exports = router;
