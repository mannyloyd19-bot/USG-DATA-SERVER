const express = require('express');
const router = express.Router();

router.get('/debug-domain', (req, res) => {
  res.json({
    host: req.headers.host,
    url: req.url
  });
});

module.exports = router;
