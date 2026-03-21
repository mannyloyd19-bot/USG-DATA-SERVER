const crypto = require('crypto');

module.exports = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const requestId = incoming || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
};
